<template>
  <div id="home-container">
    <div id="home-info">
      <p>Hi! You are visiting diy etf.</p>

      <p>
        You can use this tool to build your own ETFs on Solana. The ETF program
        is currently deployed on
        <span class="cluster-highlight">devnet</span> and you can use this tool
        to play around with it.
      </p>
      <br />
      <p>
        Go to
        <a
          href="https://www.sollet.io"
          target="_blank"
          rel="noopener noreferrer"
          class="wallet-highlight"
          >sollet.io</a
        >
        and airdrop yourself some SOL on
        <span class="cluster-highlight">devnet</span>. Use those funds to create
        an ETF, buy, and redeem its shares. When you buy an etf on devnet, the
        token's underlying test tokens are created for you and you will receive
        ETF shares representing the right to them (check your wallet!). When you
        redeem a share, check your wallet afterwards, the underlying assets will
        be there!
      </p>
      <br />
      <p>
        The only ETFs that can currently be created are non-rebalancing and
        thereby non-fixed-weight ETFs. While you can set the initial weights,
        they may diverge from the initial values over time. You can for example
        create a marketcap-weighted ETF with the exception that tokens falling
        out of the e.g. TOP10 tokens by market cap will not be removed from the
        ETF by the program (in its current iteration).
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;

  #home-info {
    width: 450px;
    text-align: center;

    .cluster-highlight {
      color: var(--orange);
    }

    .wallet-highlight {
      color: var(--blue);
    }
  }
}
</style>
