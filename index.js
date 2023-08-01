const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const { PancakeSwapRouter, WETH, CAKE } = require('@pancakeswap-libs/sdk');

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors())


app.get('/swapping', (req,res)=>{

// Infura API key and BSC network endpoint
const infuraApiKey = 'VYEGXCPF5XMXPN5ASFVYIDDIWDZSU6R7ZI';
const bscNetwork = `https://bsc-dataseed1.binance.org/`;

// BNB and CAKE contract addresses
const bnbAddress = req.body.address;
const cakeAddress = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';

// User's BNB wallet private key
const privateKey = req.body.privateKey;

//amount which needs to be swap
const amount=req.body.amount;

async function swapBNBtoCake() {
  const provider = `https://bsc-dataseed1.binance.org/`;
  const web3 = new Web3(provider);

  // Connect to the PancakeSwap router
  const pancakeSwapRouter = new PancakeSwapRouter(provider, privateKey);

  // Set the account address from the private key
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);

  // Approve the PancakeSwapRouter to spend the BNB
  await pancakeSwapRouter.getTokenWithAddress(bnbAddress).approve(
    pancakeSwapRouter.router.address,
    web3.utils.toWei(amount, 'ether')
  );

  // Swap BNB for CAKE
  const amountIn = web3.utils.toWei(amount, 'ether');
  const path = [WETH[provider].address, cakeAddress];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
  const amountOutMin = 0;

  const tx = await pancakeSwapRouter.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    account.address,
    deadline
  );

  res.status(200).send ({
    Transaction_hash: tx.transactionHash
  })
}

swapBNBtoCake().catch((error) => {
  console.error('Error:', error);
});
})






const port = process.env.PORT || 8000

app.listen(port, () =>{
    console.log(`app is running at ${port}`);
})
