/**
 * Check some basic parts of validator page are shown correctly
 */
context('Validators', () => {
  beforeEach(() => {
    cy.visit('https://explore-agent-land.sandbox.fetch-ai.com/validators')
  })

  it("Check there are correct number of validators being displayed", () => {
     cy.get(".validator-list").find(".validator-info").then(($val) => {
       const texttest = $val.text()
          cy.log("#block-table#block-table#block-tableWWWWWW " + texttest);
           expect($val).to.have.lengthOf(3)
     })
   })

  it("Check a known validator is displayed on the page", () => {
    const knownValidator = "Bond"
    cy.get(".moniker").parent().contains(knownValidator)
  })

})
