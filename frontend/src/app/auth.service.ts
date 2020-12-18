import {Injectable} from "@angular/core";
import { AuthLogin } from './models'
import { HttpClientModule, HttpClient } from '@angular/common/http'

@Injectable({
    providedIn: 'root'
    })

export class AuthService {

    constructor() { }

    getUserDetails() {
        return localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
        }
        setDataInLocalStorage(variableName, data) {
        localStorage.setItem(variableName, data);
        }
    
        getToken() {
            return localStorage.getItem('token');
            }
            clearStorage() {
            localStorage.clear();
            }



    }

