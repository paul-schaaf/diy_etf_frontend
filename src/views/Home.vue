<template>
  <div id="home-container">
    <div id="home-info">
      <p>Hi! You are visiting diy etf.</p>

      <p>
        You can use this tool to build your own ETFs on Solana. The ETF program
        is currently deployed on
        <span class="orange">devnet</span> and you can use this tool to play
        around with it.
      </p>
      <br />
      <p class="red">HOW TO</p>
      <br />
      <p>
        Go to
        <a
          href="https://www.sollet.io"
          target="_blank"
          rel="noopener noreferrer"
          class="blue"
          >sollet.io</a
        >
        and airdrop yourself some SOL on
        <span class="orange">devnet</span>. Use those funds to create an ETF,
        buy, and redeem its shares. When you buy an etf on devnet, you will
        receive ETF shares representing the right to the underlying assets. When
        you redeem a share, check your wallet afterwards, the underlying assets
        will be there!
      </p>
      <br />
      <p class="green">NOTE FOR EARLY USERS</p>
      <br />
      <p>
        ETF actions take a long time right now. This is because the client slows
        down execution not to overwhelm the devnet. On mainnet, all actions will
        likely take ~1 second. Also, when buying and redeeming shares, the
        underlying tokens are currently minted out of thin air. On mainnet, the
        program will buy them for the user and give the user the option whether
        he wants all the shares or a specific currency when redeeming shares.
      </p>
      <br />
      <p class="cyan">ETFs</p>
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

    .orange {
      color: var(--orange);
    }

    .blue {
      color: var(--blue);
    }

    .red {
      color: var(--red);
    }

    .green {
      color: var(--green);
    }

    .cyan {
      color: var(--cyan);
    }
  }
}
</style>
