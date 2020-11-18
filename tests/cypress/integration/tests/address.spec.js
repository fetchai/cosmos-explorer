import { explorerUrl } from './constants'

const testAddress = "fetch193vvag846gz3pt3q0mdjuxn0s5jrt39fsjrays"

context('Address', () => {
  beforeEach(() => {
     cy.visit(`${explorerUrl}/account/${testAddress}`)
            cy.wait(5000);
  })

    it("Check the address is found", () => {
     cy.contains(testAddress)
   })


  //
  // it("Check that at least one transaction is displayed in tabled relating to this address", () => {
  //    const expectedTotal = "95.4100 TESTFET"
  //    cy.contains("Total").parentsUntil('.row').parent().find('.value').then(($span) => {
  //  // $span is the object that the previous command yielded
  //  const total = $span.text();
  //  cy.log("Total " + total);
  //    expect(total).to.eq(expectedTotal);
  // })
  //  })
  //
  //   it("Check that the most recent transaction hash is the expected one", () => {
  //     const expectedHash = "fetch193vvag846gz3pt3q0mdjuxn0s5jrt39fsjrays"
  //    cy.get(".tab-pane").find(".address").eq(0).then(($val) => {
  //      const texttest = $val.text()
  //         cy.log("most recent transaction    !! " + texttest);
  //         expect(texttest).to.eq(expectedHash);
  //    })
  //  })

})
