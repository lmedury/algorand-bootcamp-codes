from helper import *
from algosdk.future import transaction
from algosdk import account, mnemonic
from algosdk.v2client import algod, indexer
from keys import funding_acct, funding_acct_mnemonic

import unittest

algod_address = "https://testnet-api.algonode.cloud"
indexer_address = "https://testnet-idx.algonode.cloud"
# user declared account mnemonics


unittest.TestLoader.sortTestMethodsUsing = None

class TestContract(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        cls.algod_client = algod.AlgodClient("", algod_address)
        cls.algod_indexer = indexer.IndexerClient("", indexer_address)
        cls.funding_acct = funding_acct
        cls.funding_acct_mnemonic = funding_acct_mnemonic
        cls.new_acct_priv_key, cls.new_acct_addr = account.generate_account()
        cls.new_acct_mnemonic = mnemonic.from_private_key(cls.new_acct_priv_key)
        cls.new_acct_addr = account.address_from_private_key(cls.new_acct_priv_key)
        print("Generated new account: "+cls.new_acct_addr)
        cls.app_index = 0
    
    #Methods for test cases must start with test
    def test_deploy_app(self):
        amt = 3000000
        fund_new_acct(TestContract.algod_client, TestContract.new_acct_addr, amt, TestContract.funding_acct_mnemonic)    

        print("Funded {amt} to new account for the purpose of deploying contract".format(amt = amt))

        creator_private_key = get_private_key_from_mnemonic(TestContract.new_acct_mnemonic)

        # declare application state storage (immutable)
        local_ints = 0
        local_bytes = 1
        global_ints = (
            24  # 4 for setup + 20 for choices. Use a larger number for more choices.
        )
        global_bytes = 1
        global_schema = transaction.StateSchema(global_ints, global_bytes)
        local_schema = transaction.StateSchema(local_ints, local_bytes)

        # get PyTeal approval program
        approval_program_ast = approval_program()
        # compile program to TEAL assembly
        approval_program_teal = compileTeal(
            approval_program_ast, mode=Mode.Application, version=6
        )
        # compile program to binary
        approval_program_compiled = compile_program(TestContract.algod_client, approval_program_teal)

        # get PyTeal clear state program
        clear_state_program_ast = clear_state_program()
        # compile program to TEAL assembly
        clear_state_program_teal = compileTeal(
            clear_state_program_ast, mode=Mode.Application, version=6
        )
        # compile program to binary
        clear_state_program_compiled = compile_program(
            TestContract.algod_client, clear_state_program_teal
        )

        # configure registration and voting period
        status = TestContract.algod_client.status()
        regBegin = status["last-round"] + 10
        regEnd = regBegin + 10
        voteBegin = regEnd + 1
        voteEnd = voteBegin + 10

        print(f"Registration rounds: {regBegin} to {regEnd}")
        print(f"Vote rounds: {voteBegin} to {voteEnd}")

        # create list of bytes for app args
        app_args = [
            intToBytes(regBegin),
            intToBytes(regEnd),
            intToBytes(voteBegin),
            intToBytes(voteEnd),
        ]
        
        # create new application
        TestContract.app_index = create_app(
            TestContract.algod_client,
            creator_private_key,
            approval_program_compiled,
            clear_state_program_compiled,
            global_schema,
            local_schema,
            app_args,
        )

        print("Deployed new app with APP ID: "+str(TestContract.app_index))

        global_state = read_global_state(
                TestContract.algod_client, account.address_from_private_key(creator_private_key), TestContract.app_index
            )
        
        self.assertEqual(global_state['VoteBegin'], voteBegin)

def tearDownClass(self) -> None:
    return super().tearDown()

if __name__ == '__main__':
    unittest.main()