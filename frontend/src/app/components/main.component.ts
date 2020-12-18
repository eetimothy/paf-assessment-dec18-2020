import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CameraService } from '../camera.service';
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
	  @ViewChild('upload') upload: ElementRef;

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
	async share(): Promise <void> {
		//handle upload
		const data = new FormData()
		//console.log(this.cameraSvc.getImage())
		data.set('my-img', this.cameraSvc.getImage().imageData)
		data.set('form', JSON.stringify(this.form.value))
		await this.http.post<any>('http://localhost:3000/main', data).toPromise()
	  }
	
	

	clear() {
		this.imagePath = '/assets/cactus.png'
	}
}
