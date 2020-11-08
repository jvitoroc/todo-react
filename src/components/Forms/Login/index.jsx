import React, { Component } from 'react';
import classes from '../common.module.css';
import BaseForm from '../BaseForm';
import Button from '../Button';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginSucessfull } from '../../../actions';
import InputText from '../InputText';

class Login extends Component {
    state = { formState: null }

    login = (username, password)=>{
		const init = {
			method: 'POST',
			body: JSON.stringify({username, password}),
			headers: {'Content-Type': 'application/json'}
		}

		return fetch('http://localhost:8000/user/session', init);
	}

    handleSubmit = (values, { setSubmitting, setErrors })=>{
        this.changeFormState('LOADING', ()=>{
            this.login(values.username, values.password)
            .then(
                async response => {
                    await new Promise((r)=>setTimeout(r, 250));
                    let json = await response.json();
                    if(response.ok === false){
                        setErrors({"*": json.errors ? '':json.message, ...json.errors});
                        setSubmitting(false);
                        this.changeFormState(null);
                    }
                    else{
                        this.changeFormState('SUCCESS', ()=>setTimeout(()=>this.props.loginSucessfull(json.data), 1000));
                    }
                }
            )
        });
    }

    changeFormState = (name, callback)=>{
        this.setState({formState: name}, ()=>{
            if (callback) callback();
        })
    }

    validateForm = (values)=>{
        const errors = {};
        if (!values.username)
            errors.username = 'Username is required.';

        if (!values.password)
            errors.password = 'Password is required.';

        return errors;
    }

    render() {
        return (
            <BaseForm
                initialValues={{ username: '', password: '', repeatPassword: '', '*': ''}}
                validate={this.validateForm}
                onSubmit={this.handleSubmit}
                state={this.state.formState}
                after={<Link className={classes['link']} to={'/signup'}>Create an account</Link>}
            >
                {({ isSubmitting, errors, values })=>{
                    return (
                        <>
                            <InputText name={'username'} label={'Username'} value={values.username} error={errors.username}/>
                            <InputText name={'password'} label={'Password'}  value={values.password} error={errors.password} password/>
                            <Button disabled={isSubmitting} type="submit" value="Log in"/>
                        </>
                    )
                }}
            </BaseForm>
        );
    }
}


const mapStateToProps = (state) => {
    return {...state};
}

const mapDispatchToProps = dispatch => {
    return {
        loginSucessfull: (data) => {
            dispatch(loginSucessfull(data))
        }
    }
}

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login);

export default withRouter(ConnectedLogin);