import { explorerUrl } from './../constants'

/**
 * Very rudementary and only a) checks page renders and b) correctly checks that for this user we have missed no precommits.
 */
context('Validators', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/validator/F0B2B12E0942F1EF2821E4921746597460CC077C/missed/precommits`)
    cy.wait(3000);
  })

  it("Check missed no precommits", () => {
       cy.contains("I do not miss precommit")
   })

})
