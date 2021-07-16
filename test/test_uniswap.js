const IERC20 = artifacts.require('IERC20');
const Swap_tokens_uniswap = artifacts.require('Swap_tokens_uniswap');
const BN = require('bn.js');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Swap_tokens_uniswap', (accounts) => {

    const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
    const AAVE = '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9';
    const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const WBTC = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';

    const DAI_WHALE = '0x16463c0fdB6BA9618909F5b120ea1581618C1b9E';
    const WETH_WHALE = '0x56178a0d5F301bAf6CF3e1Cd53d9863437345Bf9';

    const AMOUNT_IN_DAI = new BN(10).pow(new BN(18)).mul(new BN(1000000));
    const AMOUNT_IN_WETH = new BN(10).pow(new BN(18)).mul(new BN(100));

    // this can change depending on the price
    const AMOUNT_OUT_MIN_AAVE = new BN(10).pow(new BN(18)).mul(new BN(3200));
    const AMOUNT_OUT_MIN_AAVE_FAIL = new BN(10).pow(new BN(18)).mul(new BN(3900));

    const AMOUNT_OUT_MIN_WBTC = new BN(10).pow(new BN(8)).mul(new BN(5));
    const AMOUNT_OUT_MIN_WBTC_FAIL = new BN(10).pow(new BN(8)).mul(new BN(7));

    let TO = accounts[0];
    let uniswap, tokenIn, tokenOut;

    beforeEach( async () => {
        uniswap = await Swap_tokens_uniswap.new();

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE],
        });
        
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [WETH_WHALE],
        });
    });

    it('should swap DAI for AAVE', async () => {

        tokenIn = await IERC20.at(DAI);
        tokenOut = await IERC20.at(AAVE);

        await tokenIn.approve(uniswap.address, AMOUNT_IN_DAI, { from: DAI_WHALE });
        await uniswap.swap_tokens(tokenIn.address, tokenOut.address, AMOUNT_IN_DAI, AMOUNT_OUT_MIN_AAVE, TO, { from: DAI_WHALE });

        console.log(`${TO} received ${await tokenOut.balanceOf(TO)/1e18} AAVE`);
    })

    it('should not swap DAI for AAVE if output is less than AMOUNT_OUT_MIN', async () => {

        tokenIn = await IERC20.at(DAI);
        tokenOut = await IERC20.at(AAVE);

        await tokenIn.approve(uniswap.address, AMOUNT_IN_DAI, { from: DAI_WHALE });
        
        await uniswap
            .swap_tokens(tokenIn.address, tokenOut.address, AMOUNT_IN_DAI, AMOUNT_OUT_MIN_AAVE_FAIL, TO, 
                { from: DAI_WHALE }).should.be.rejected;
    })

    it('should swap WETH for WBTC', async () => {

        tokenIn = await IERC20.at(WETH);
        tokenOut = await IERC20.at(WBTC);

        await tokenIn.approve(uniswap.address, AMOUNT_IN_WETH, { from: WETH_WHALE });
        await uniswap
            .swap_tokens(tokenIn.address, tokenOut.address, AMOUNT_IN_WETH, AMOUNT_OUT_MIN_WBTC, TO, 
                { from: WETH_WHALE })
    
        console.log(`${TO} received ${await tokenOut.balanceOf(TO)/1e8} WBTC`)
    })
    
    it('should not swap WETH for WBTC if output is less than AMOUNT_OUT_MIN', async () => {

        tokenIn = await IERC20.at(WETH);
        tokenOut = await IERC20.at(WBTC);

        await tokenIn.approve(uniswap.address, AMOUNT_IN_WETH, { from: WETH_WHALE });
        
        await uniswap
            .swap_tokens(tokenIn.address, tokenOut.address, AMOUNT_IN_WETH, AMOUNT_OUT_MIN_WBTC_FAIL, TO, 
                { from: WETH_WHALE }).should.be.rejected;
    })
});