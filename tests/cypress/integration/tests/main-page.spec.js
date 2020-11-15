import { explorerUrl } from './constants'


context('Main Page', () => {
  beforeEach(() => {
    cy.visit(explorerUrl)
  })

  it("Check Latest Block Height has expected value", () => {
     const expectedBlockHeight = "6"
     cy.contains("Latest Block Height").parentsUntil('.card-body').parent().find('.text-primary').then(($span) => {

   const actualBlockHeight = $span.text();
   cy.log("Latest Block Height " + actualBlockHeight);
     expect(actualBlockHeight).to.eq(expectedBlockHeight)
  })
})

  it("Check Average Block Time has expected value", () => {
     const expectedAverageBlockTime = "102,904.15"
     cy.contains("Average Block Time").parentsUntil('.card-body').parent().find('.text-primary').then(($span) => {

   const actualAverageBlockTime = $span.text();
   cy.log("Latest Block Height " + actualAverageBlockTime);
     expect(actualAverageBlockTime).to.eq(expectedAverageBlockTime)
  })
})

  it("Check Active Validators has expected value", () => {
     const expectedAverageValidators = "3"
     cy.contains("Active Validators").parentsUntil('.card-body').parent().find('.text-primary').then(($span) => {

   const actualActiveValidators = $span.text();
   cy.log("Active Validators " + actualActiveValidators);
     expect(expectedAverageValidators).to.eq(actualActiveValidators)
  })
})

  it("Check Online Voting Power has expected value", () => {
     const expectedOnlineVotingPower = "300.00"
     cy.contains("Online Voting Power").parentsUntil('.card-body').parent().find('.text-primary').then(($span) => {

   const actualOnlineVotingPower = $span.text();
   cy.log("actualOnlineVotingPower" + actualOnlineVotingPower);
     expect(actualOnlineVotingPower).to.eq(expectedOnlineVotingPower)
  })
})

})
