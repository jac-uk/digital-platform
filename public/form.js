class ApplicationForm {
    constructor(formElement) {
        this.formElement = formElement;
        formElement.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log('Form submitted');
        console.log(this.getFormData());
    }

    getFormData() {
        return {
            forename: this.getFieldValue('forename'),
            surname: this.getFieldValue('surname'),
            dob: this.getFieldValue('dob'),
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
}

new ApplicationForm(document.getElementById('application-form'));
