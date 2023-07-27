$(document).ready(function () {

    $('#submit_login_form').click(function (e) {
        e.preventDefault();
        // Check if the form is valid
        let theform = document.getElementById('login_form');
        if (!theform.checkValidity()) {
            theform.reportValidity();
            return false;
        }
        let email = $('#email').val();
        let password = $('#password').val();
        let fd = {
            "email": email,
            "password": password
        }
        let url = "/api/v1/user/login"
        let status = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Processing login...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
        $('body').append(status);
        let k1 = new GENERIC_APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(fd)).then(function (data) {
            $(status).remove();
            let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Login successful", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(status2);
            location.href = "/dashboard";
        }).catch(function (err) {
            $(status).remove();
            let status2 = new GENERIC_META_FLOATING_DIVS().bottom_bar_notification("Login failed", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(status2);
            console.log(err);
        });
    });
});