describe('File upload', function() {

  describe("when upload is successful", () => {

    it('displays a confirmation message', function() {
      cy.visit('http://localhost:8002?ref=test');

      const fileName = 'test.pdf';
   
      cy.fixture(fileName).then(fileContent => {
        cy.get('input[type=file]').upload(
          { fileContent, fileName, mimeType: 'application/pdf' },
          { subjectType: 'input' }
        );
      });

      cy.get("#screen-received").find("h1").contains("Independent assessment received");
    })

  })

})
