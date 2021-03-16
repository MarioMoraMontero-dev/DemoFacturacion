import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { encode } from 'base64-arraybuffer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewFactura } from '../interfaces/new-factura';
import { RestapiService } from '../servicios/restapi.service';


@Component({
  selector: 'app-registrar-factura',
  templateUrl: './registrar-factura.component.html',
  styleUrls: ['./registrar-factura.component.css']
})
export class RegistrarFacturaComponent implements OnInit {
  form!:FormGroup;
  public fechaActual!:Date;
  constructor(private formBuilder:FormBuilder, private rest:RestapiService) { }
  @Input() facNew = new NewFactura();
  factura1!:String;
  facturaBase!:String;
  token:any;
  login: any = [];
  respuesta: any = [];
  FacturaCreada!:boolean;
  ErrorFactura!:boolean;
  botonEnviar!:boolean;
  FacturaAgregada!:string;
  documentoAgregado!:boolean;
  botonVolverAenviar!:boolean;
  tipoFacturas:string[] = ["--Tipo de factura--","Alimentación","Transporte","Hospedaje","Pases Aéreos","Kilometraje"];
  public ocultarSeccionArchivoPDF!:boolean;
  ngOnInit(): void {
    this.ocultarSeccionArchivoPDF = true;
    this.fechaActual = new Date('dd/MM/yyyy');
    this.buildForm();
    this.ErrorFactura = true;
    this.FacturaCreada = true;
    this.botonEnviar = false;
    this.botonVolverAenviar = true;
    this.documentoAgregado = true;
  }

  private buildForm(){
    this.form = this.formBuilder.group({
      fechaDeRegistro: [''],
      tipoFactura: [''],
      detalleFactura: [''],
      montoFactura: ['']
     
    });
    this.form.controls['tipoFactura'].setValue('--Tipo de factura--', {onlySelf: true});
    //#region FechaRegistro
      this.form.get('fechaDeRegistro')?.valueChanges
      .subscribe(value =>{
          console.log(value);
          this.facNew.fechaRegistro = value;
          
          
      });
  
   //#endregion FechaRegistro

  //#regin tipoFactura 
       this.form.get('tipoFactura')?.valueChanges
       .subscribe(value =>{
           console.log(value);
           this.facNew.tipoFacturaRegis = value;
       });
   
  //#endregion tipoFactura

  //#regin detalleFactura
  this.form.get('detalleFactura')?.valueChanges
  .subscribe(value =>{
      console.log(value);
      this.facNew.detalle = value;

  });

//#endregion detalleFactura

//#regin montoFactura 
this.form.get('montoFactura')?.valueChanges
.subscribe(value =>{
    console.log(value);
    this.facNew.montoFactura = value;
});

//#endregion montoFactura

//#regin tipoFactura 
this.form.get('tipoFactura')?.valueChanges
.subscribe(value =>{
    console.log(value);
});

//#endregion tipoFactura

  

  }




  onFileChanged(event:any) {
    const  fileUploadBodies = this.getBase64EncodedFileData(event.target.files[0].name);
    console.log(event.target.files[0]);
    console.log(event.target.files[0].type);
    if(event.target.files[0].type == 'application/pdf'){
      this.ocultarSeccionArchivoPDF = false;
      this.documentoAgregado = false;
      this.FacturaAgregada = event.target.files[0].name;
    }else{
      this.documentoAgregado = false;
      this.ocultarSeccionArchivoPDF = true;
      this.FacturaAgregada = event.target.files[0].name;
    }
    console.log('Cuerpo del archivo: '+fileUploadBodies);
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      console.log(reader.result);
      this.facNew.factura = reader.result;
        this.factura1 = this.facNew.factura;
        const dataFactura = this.factura1.split('base64,').pop();
        console.log('Salida factura: '+dataFactura );
        this.facNew.factura = dataFactura;
        this.facNew.tipoFactura = event.target.files[0].type;
        this.facNew.nameFactura = event.target.files[0].name;
      console.log(reader.result);
    };
    
  }

  getToken(){
      this.rest.getToken().subscribe((data: {})=>{
      console.log(data);
      this.login.push(data);
      this.sendFactura(this.login);
      console.log(this.login);
    })
  }
      

  sendFactura(datos:any){
    for(let l of datos) {
      this.token = l.access_token;
      this.facNew.token = l.access_token;
      console.log("SalidaToken: "+this.token);
    }
    this.rest.postaddFactura(this.token,this.facNew) .subscribe((data: {})=>{
      console.log(data);
      this.respuesta.push(data);
      for(let l of this.respuesta){
        if(l.Estado = 'Creado'){
          this.botonEnviar = true;
          this.FacturaCreada = false;
          this.ErrorFactura = true;
          this.botonVolverAenviar = false;
          
        }else{
          this.botonEnviar = false;
          this.FacturaCreada = true;
          this.ErrorFactura = false;
        }
      }
      
    })
}





  getBase64EncodedFileData(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const { result } = reader;
        const data = result as ArrayBuffer; 
        const base64Encoded = encode(data); 
  
        observer.next(base64Encoded);
        observer.complete();
      };
  
      reader.onerror = () => {
        observer.error(reader.error);
      };
  
      reader.readAsArrayBuffer(file);
    });
  }

  registrarfactura(event:Event){
    event.preventDefault();
    if(this.form.valid){
     
      
      
    }else{
      this.form.markAllAsTouched();
      console.log(this.form.getError);
     
    }
    
  }


agegarOtraFactura(){
  this.form.reset();
  this.documentoAgregado = true;
  this.FacturaCreada = true;
  this.ocultarSeccionArchivoPDF = true;
  this.botonEnviar = false;
  this.botonVolverAenviar = true;
}

}
