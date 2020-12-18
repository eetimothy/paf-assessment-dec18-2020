import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { AuthService } from '../auth.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
	errorMessage = ''
  form: FormGroup

	constructor(private fb: FormBuilder, private http: HttpClient) { }

	ngOnInit(): void { 
    this.form = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })
}
  processLogin() {
    console.info('form = ', this.form.value)
    const value = this.form.value

    //fill in the form (x-www-form-urlencoded)
    let params = new HttpParams()
    params = params.set('username', value['username'])
    params = params.set('password', value['password'])

    //set the HTTP header
    let headers = new HttpHeaders()
    headers = headers.set('Content-Type', 
    'application/x-www-form-urlencoded')

    //make the POST request
    this.http.post<any>('http://localhost:3000/login',
      params.toString(), { headers }) //must add toString()
      .toPromise()
      .then(res => {
        console.info('Response: ', res)
      })
      .catch(err => {
        console.error('ERROR: ', err)
      })
  }


  
}
