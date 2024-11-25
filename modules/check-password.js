module.exports.checkPassword = function (pass, repass, error_code) {
    const regex = /^(?=.*[A-Z])(?=.*[0-9].*[0-9])(?=.*[!@#$%^&*()_+|~=`{}[:;<>,./?\\[\]\]\-]).{8,64}$/

    if (!regex.test(pass))  return error_code = 1

    if (pass !== repass)    return error_code = 2

    return error_code;
}
