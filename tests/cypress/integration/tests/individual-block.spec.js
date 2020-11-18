import { explorerUrl } from './constants'


context('Individual Blocks', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/blocks/1`)
                cy.wait(5000);
  })

  it("rudimentary check that page loads and shows us the correct block hash", () => {
    const expectedBlockHash = "F06AF09B90C6D7AD9DD1B78C3113E79C86C4ECBCA93814052DA6082706D6BF45";
         cy.contains(expectedBlockHash)
})

})
