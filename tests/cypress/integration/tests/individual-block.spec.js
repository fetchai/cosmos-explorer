import { explorerUrl } from './constants'


context('Individual Blocks', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}blocks/1`)
  })

  it("Check inflation rate is displayed correctly", () => {
     const expectedInflationRate = "0"
     cy.contains("Latest Block Height").parentsUntil('card-body').parent().then(($span) => {

   const actualInflationRate = $span.text();
   cy.log("Latest Block Height " + actualInflationRate);
     expect(actualInflationRate).to.eq(expectedInflationRate)
  })
})

})
