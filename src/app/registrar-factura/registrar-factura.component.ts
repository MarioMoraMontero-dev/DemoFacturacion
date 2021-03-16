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
  ProcesandoFactura!:boolean;
  SinFactura!:boolean;
  EroresFormularioFactura!:boolean;
  tipoFacturas:string[] = ["Alimentación","Transporte","Hospedaje","Pases Aéreos","Kilometraje"];
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
    this.ProcesandoFactura = true;
    this.SinFactura = true;
    this.EroresFormularioFactura = true;
  }

  private buildForm(){
    this.form = this.formBuilder.group({
      fechaDeRegistro: ['',[Validators.required]],
      tipoFactura: ['',[Validators.required]],
      detalleFactura: [''],
      montoFactura: ['',[Validators.pattern("^[0-9]*")]],
      codigoViaje: ['',[Validators.required,Validators.pattern("^[a-zA-Z0-9]*")]]
     
    });
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
this.form.get('codigoViaje')?.valueChanges
.subscribe(value =>{
    console.log(value);
    this.facNew.codigoViaje = value;
});

//#endregion tipoFactura

//#region CodigoViaje
  this.form.get('fechaDeRegistro')?.valueChanges
  .subscribe(value =>{
      console.log(value);
      this.facNew.fechaRegistro = value;
      
      
  });

//#endregion CodigoViaje

  }




  onFileChanged(event:any) {
    this.SinFactura = true;
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
    
    if(this.facNew.factura == null || this.facNew.factura == undefined){
      this.SinFactura = false;
    }else{
      this.SinFactura = true;
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
            this.ProcesandoFactura = true;
            this.EroresFormularioFactura = true;
            
          }else{
            this.botonEnviar = false;
            this.FacturaCreada = true;
            this.ErrorFactura = false;
            this.ProcesandoFactura = true;
            this.EroresFormularioFactura = true;
            this.botonVolverAenviar = true;
          }
        }
        
      })
    }
    
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
      this.EroresFormularioFactura = true;
      this.ProcesandoFactura = false;
    }else{
      this.form.markAllAsTouched();
      console.log(this.form.getError);
      this.EroresFormularioFactura = false;
    }
    
  }

agegarOtraFactura(){
  this.form.reset();
  this.facNew.factura = null;
  this.documentoAgregado = true;
  this.FacturaCreada = true;
  this.ocultarSeccionArchivoPDF = true;
  this.botonEnviar = false;
  this.botonVolverAenviar = true;
  this.EroresFormularioFactura = true;
}

}
