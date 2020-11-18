import { explorerUrl } from './constants'


context('Transactions', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/transactions`)
    cy.wait(3000);
  })

  it("Check inflation rate is displayed correctly", () => {
     const expectedInflationRate = "0.00%"
     cy.contains("Inflation").parentsUntil('.col-md-auto').parent().find('strong').then(($span) => {
   // $span is the object that the previous command yielded
   const actualInflationRate = $span.text();
   cy.log("inflation " + actualInflationRate);
     expect(actualInflationRate).to.eq(expectedInflationRate)
  })
})

  it("Check Community Pool is displayed correctly", () => {
     const expectedCommunityPool = "11,101.3000 atestfet"
     cy.contains("Community Pool").parentsUntil('.col-md-auto').parent().find('strong').then(($span) => {
   // $span is the object that the previous command yielded
   const actualCommunityPool = $span.text();
   // cy.log("actualCommunityPool " + actualCommunityPool);
    expect(actualCommunityPool).to.eq(expectedCommunityPool)
  })
})


  it("Check there are multiple transactions being displayed on the page", () => {
     cy.get(".transactions-list").find(".row").then(($val) => {
       const texttest = $val.text()
          expect($val.length).to.be.greaterThan(1)
     })
   })


  it("Check most recent transaction is displayed correctly", () => {
     const expectedTransactionHash = "fetch193vvag846gz3pt3q0mdjuxn0s5jrt39fsjrays"
     cy.get("#transactions").first(".row").find('.address').eq(0).then(($span) => {
   const actualTransactionHash = $span.text();
     expect(actualTransactionHash).to.eq(expectedTransactionHash)
  })

   })

})
