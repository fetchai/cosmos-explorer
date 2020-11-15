import { explorerUrl } from './../constants'

/**
 * Check some basic parts of validator page are shown correctly
 */
context('Validators', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/validator/F0B2B12E0942F1EF2821E4921746597460CC077C/missed/blocks`)
    cy.wait(3000);
  })

  it("Check missed block count is correct", () => {
    const expectedMissed = "1"
     cy.get('.missed-records-table').find('tr').eq(1).find('td').eq(4).then(($val) => {
       const missed = $val.text()
           expect(expectedMissed).to.eq(missed)
     })
})

  it("Check missed ratio to be correct", () => {
    const expectedMissedRatio = "100.0%"
     cy.get('.missed-records-table').find('tr').eq(1).find('td').eq(5).then(($val) => {
       const missed = $val.text()
           expect(expectedMissedRatio).to.eq(missed)
     })
})
})

