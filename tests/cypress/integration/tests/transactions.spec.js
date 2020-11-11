context('Transactions', () => {
  beforeEach(() => {
    cy.visit('https://explore-agent-land.sandbox.fetch-ai.com/transactions')
  })

  it("Check inflation rate is displayed correctly", () => {
     const expectedInflationRate = "0"
     cy.contains("Inflation").parentsUntil('.col-md-auto').parent().find('strong').then(($span) => {
   // $span is the object that the previous command yielded
   const actualInflationRate = $span.text();
   cy.log("inflation " + actualInflationRate);
     expect(actualInflationRate).to.eq(expectedInflationRate)
  })
})

  it("Check Community Pool is displayed correctly", () => {
     const expectedCommunityPool = "11,101.3 atestfet"
     cy.contains("Community Pool").parentsUntil('.col-md-auto').parent().find('strong').then(($span) => {
   // $span is the object that the previous command yielded
   const actualCommunityPool = $span.text();
   cy.log("actualCommunityPool " + actualCommunityPool);
    expect(actualCommunityPool).to.eq(expectedCommunityPool)
  })
})


  it("Check there are many transactions being displayed on the page", () => {
     const expectedCommunityPool = "11,101.3 atestfet"
     cy.get(".transactions-list").find(".row").then(($val) => {
       const texttest = $val.text()
          cy.log("texttestqqq " + texttest);
          expect($val.length).to.be.greaterThan(5)
     })
   })


  it("Check most recent transaction is displayed correctly", () => {
     const expectedTransactionHash = "fetch193vvag846gz3pt3q0mdjuxn0s5jrt39fsjrays"
     cy.get("#transactions").first(".row").find('.address').eq(0).then(($span) => {
   // $span is the object that the previous command yielded
   const actualTransactionHash = $span.text();
   cy.log("expectedTransactionHash ZAQ" + actualTransactionHash);
    // expect(actualTransactionHash).to.eq(expectedTransactionHash)
  })

   })

})
