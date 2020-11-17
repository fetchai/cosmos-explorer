import { explorerUrl } from './constants'


context('Hash', () => {
  beforeEach(() => {
    cy.visit(`${explorerUrl}/transactions/E27F373D818DA25629CEADE9C6D2FEA3218D59D27246F383693CA0C257CDA1F7`)
    cy.wait(3000);
  })

  it("Check that at height displayed on page is exepected", () => {
     const expectedHeight = "108,786"
     cy.get("#transaction").contains("Height").parent().next().find('a').then(($span) => {
   // $span is the object that the previous command yielded
   const total = $span.text();
   cy.log("Total " + total);
   expect(total).to.eq(expectedHeight);
  })
   })

  it("Check that at Fee displayed on page is exepected", () => {
     const expectedFee = "1000 atestfet"
     cy.get("#transaction").contains("Fee").parent().next().then(($span) => {
   // $span is the object that the previous command yielded
   const actualFee = $span.text().trim();
   cy.log("fee " + actualFee);
   expect(actualFee).to.eq(expectedFee);
  })
   })


  it("Check that Gas displayed on page is exepected", () => {
     const expectedGas = "67,957 / 80,000"
     cy.get("#transaction").contains("Gas").parent().next().then(($span) => {
   const actualGas = $span.text().trim();
   cy.log("Gas " + actualGas);
   expect(actualGas).to.eq(expectedGas);
  })
   })

  it("Check that Memo displayed on page is exepected", () => {
    //todo add a memo to mock data
     const expectedMemo = ""
     cy.get("#transaction").contains("Memo").parent().next().then(($span) => {
   const actualMemo = $span.text().trim();
   cy.log("Memo" + actualMemo);
   expect(actualMemo).to.eq(expectedMemo);
  })
   })


  it("Check that Activities show at least one successful transaction", () => {
     cy.get("#transaction").find(".badge-success").then(($val) => {
       const texttest = $val.text()
          cy.log("texttestqqq " + texttest);
          expect($val.length).to.be.greaterThan(0)
     })
   })




})
