class ApplicationForm {
    constructor(formElement, firestore) {
        this.formElement = formElement;
        this.firestore = firestore;
        formElement.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(event) {
        event.preventDefault();
        const formData = this.getFormData();
        this.saveToFirebase(formData);
    }

    getFormData() {
        // Create a Date object from the DOB field value
        const dobField = this.getFieldValue('dob');
        const dob = dobField ? new Date(dobField) : null;

        return {
            forename: this.getFieldValue('forename'),
            surname: this.getFieldValue('surname'),
            dob: dob,
            email: this.getFieldValue('email'),
            phone: this.getFieldValue('phone'),
            address: this.getFieldValue('address'),
            postcode: this.getFieldValue('postcode'),
            country: this.getFieldValue('country')
        };
    }

    getFieldValue(name) {
        return this.formElement.querySelector("[name='" + name + "']").value;
    }

    saveToFirebase(data) {
        console.log('Saving to Firestore', data);
        this.firestore.collection('applications').add(data)
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Get the form element
    const form = document.getElementById('application-form');

    // Initialize Cloud Firestore through Firebase
    const db = firebase.firestore();

    // Disable deprecated features
    db.settings({
        timestampsInSnapshots: true
    });

    new ApplicationForm(form, db);
});
