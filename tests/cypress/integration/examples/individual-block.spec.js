context('Transactions', () => {
  beforeEach(() => {
    cy.visit('https://explore-agent-land.sandbox.fetch-ai.com')
  })

  it("Check inflation rate is displayed correctly", () => {
     const expectedInflationRate = "0"
     cy.contains("Latest Block Height").parentsUntil('card-body').parent().then(($span) => {
   // $span is the object that the previous command yielded
   const actualInflationRate = $span.text();
   cy.log("Latest Block Height " + actualInflationRate);
     expect(actualInflationRate).to.eq(expectedInflationRate)
  })
})



})
