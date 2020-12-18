import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {CameraService} from '../camera.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
	
	form: FormGroup
	imagePath = '/assets/cactus.png'
  	apiUrl = "http://localhost:3000";

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private http: HttpClient) { }

	ngOnInit(): void {
	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl
	  }
	  this.form = this.fb.group({
		title: this.fb.control(''),
		comments: this.fb.control(''),
		imagefile: this.fb.control('', [Validators.required])
	  })
	}
	share() {
		console.info('form = ', this.form.value)
		const value = this.form.value
	
		//fill in the form (x-www-form-urlencoded)
		let params = new HttpParams()
		params = params.set('title', value['title'])
		params = params.set('comments', value['comments'])
	
		//set the HTTP header
		let headers = new HttpHeaders()
		headers = headers.set('Content-Type', 
		'application/x-www-form-urlencoded')
	
		//make the POST request
		this.http.post<any>('http://localhost:3000/main',
		  params.toString(), { headers }) //must add toString()
		  .toPromise()
		  .then(res => {
			console.info('Response: ', res)
		  })
		  .catch(err => {
			console.error('ERROR: ', err)
		  })
	  }
	
	

	clear() {
		this.imagePath = '/assets/cactus.png'
	}
}
