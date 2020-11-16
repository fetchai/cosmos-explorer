import { explorerUrl } from './../constants'

/**
 * Check some basic parts of validator page are shown correctly
 */
context('Validators', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/validators`)
    cy.wait(3000);
  })

  it("Check there are correct number of validators being displayed", () => {
     cy.get(".validator-list").find(".validator-info").then(($val) => {
       const texttest = $val.text()
          cy.log("#block-table#block-table#block-tableWWWWWW " + texttest);
           expect($val).to.have.lengthOf(4)
     })
   })

  it("Check all validators are displayed on the page", () => {

    const knownValidatorBond = "Bond"
    const knownValidatorBourne = "Bourne"
    const knownValidatorHunt = "Hunt"
    const knownValidatorPowers = "Powers"

    const validatorExists = (name) => {
    cy.get(".moniker").parent().contains(name)
    }

    validatorExists(knownValidatorBond)
    validatorExists(knownValidatorBourne)
    validatorExists(knownValidatorHunt)
    validatorExists(knownValidatorPowers)

  })
})
