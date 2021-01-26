import { explorerUrl } from './../constants'

context('Validators', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/validator/cosmosvaloper1cct4fhhksplu9m9wjljuthjqhjj93z0sknrr4a`)
    cy.wait(3000);
  })

  // it("Check correct number of missed blocks calculated correctly", () => {
  //    cy.contains("Last 250 blocks").parentsUntil(".rows").contains("83.33333333333334")
  //  })

  it("Check all voting power displayed correctly", () => {
     cy.get(".voting-power").contains("100")
  })
})
