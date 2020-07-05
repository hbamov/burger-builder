import * as actionTypes from './actionTypes';
import axios from 'axios';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    }
};

export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId: userId
    }
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');

    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const chechAuthTimeout = (expirationDate) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationDate * 1000)
    }
}

export const auth = (email, password, isSignup) => {
    return dispatch => {
        dispatch(authStart());

        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        }

        let postURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDdZnEXRkCh-WHpzmKzcsWtH0Ni0ndnkcI'

        if(isSignup) {
            postURL = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDdZnEXRkCh-WHpzmKzcsWtH0Ni0ndnkcI';
        }

        axios.post(postURL, authData)
            .then(response => {
                const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);

                localStorage.setItem('token', response.data.idToken);
                localStorage.setItem('expirationDate', expirationDate)
                localStorage.setItem('userId', response.data.localId)

                dispatch(authSuccess(response.data.idToken, response.data.localId));
                dispatch(chechAuthTimeout(response.data.expiresIn))
            })
            .catch(error => {
                dispatch(authFail(error.response.data.error))
            })
    }
}

export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if(!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if(expirationDate > new Date()) {
                const userId = localStorage.getItem('userId')
                const authTimeRemaining = (expirationDate.getTime() - new Date().getTime()) / 1000;

                dispatch(authSuccess(token, userId));
                dispatch(chechAuthTimeout(authTimeRemaining));
            }
            else {
                dispatch(logout())
            }
        }
    }
}