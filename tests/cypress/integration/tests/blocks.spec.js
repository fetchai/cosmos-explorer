import { explorerUrl } from './constants'

context('Blocks', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/blocks`)
                cy.wait(5000);
  })

  it("Check there are many blocks being displayed on the page", () => {
     cy.get("#block-table").find(".block-info").then(($val) => {
       const texttest = $val.text()
          cy.log("#block-table#block-table#block-table " + texttest);
           expect($val.length).to.be.greaterThan(5)
     })
   })

  it("Check most recent block is displayed in the page", () => {
    const recentBlockHash = "058E36E241D85CB04FCA72C324883936A6D12194A533CC6973F1F81AC78DDB90"
    cy.contains(recentBlockHash)
  })

})
