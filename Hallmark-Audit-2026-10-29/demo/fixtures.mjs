const campaign={id:'DEMO-C01',name:'Aurora · Lanzamiento de temporada',client:'Estudio Aurora (ficticio)',client_id:'DEMO-CL01',brand:'Aurora Demo',code:'AUR',prefix:'AUR',status:'ACTIVA',profiles_source_url:'',requires_product_default:false,requires_script_default:true};
const clients=[{id:'DEMO-CL01',name:'Estudio Aurora (ficticio)',status:'ACTIVO'}];
const names=['Alba Ejemplo','Bruno Muestra','Celia Demostración','Daniel Prueba','Elena Modelo','Fabio Ensayo'];
export const state={actor:{email:'operador@example.test',name:'Operador de demostración',role:'OPERADOR'},campaigns:[campaign,{...campaign,id:'DEMO-C02',name:'Horizonte · Campaña sin iniciar',code:'HOR',prefix:'HOR',status:'PAUSADA'}],clients,client_access:[{email:'cliente@example.test',name:'Cliente de demostración',status:'ACTIVO',campaign_ids:['DEMO-C01']}],talents:[],creators:[],deliverables:[],reviews:[],versions:[],events:[],creator_messages:[],agreements:[],agreement_versions:[],agreement_documents:[],talent_documents:[],notification_seen_event_ids:[],product_acquisitions:[]};
for(let i=0;i<6;i++){
 const id=`DEMO-P${i+1}`,tid=`DEMO-T${i+1}`,did=`DEMO-D${i+1}`;
 const status=['PENDING','PENDING','CHANGES_REQUESTED','APPROVED','APPROVED','PENDING'][i];
 state.creators.push({id,campaign_id:campaign.id,talent_id:tid,local_id:`AUR-00${i+1}`,name:names[i],handle:`demo_${i+1}`,status:'ACTIVO',requires_product:false,logistics_status:'NO_APLICA',responsible:'Operador demo',next_action:'Revisar material',due_date:i<2?'2026-10-27':'2026-11-05',workflow_state:'IN_PROGRESS',workflow_label:'En proceso',published_count:i===4?1:0,deliverable_count:1});
 state.talents.push({id:tid,full_name:names[i],public_name:names[i],type:'CREADOR',vertical:'Estilo de vida',phone:'',email:`talento${i+1}@example.test`,instagram:`demo_${i+1}`,instagram_followers:'12000',instagram_followers_captured_at:'2026-10-20',tiktok:'',tiktok_followers:'',tiktok_followers_captured_at:'',city:'Ciudad de México',state:'CDMX',country:'México',address:'',postal_code:'',status:'ACTIVO',notes:'Perfil ficticio para auditoría; no contactar.',profiles:[],functions:[{participation_id:id,campaign_id:campaign.id,local_id:`AUR-00${i+1}`,status:'ACTIVO',responsible:'Operador demo',next_action:'Revisar material',assigned_responsible:'',assigned_next_action:''}]});
 state.deliverables.push({id:did,campaign_id:campaign.id,creator_id:id,format:i%2?'STORY':'REEL',label:`Demostración ${i+1}`,state:i===4?'PUBLISHED':'IN_PROGRESS',responsible:'Operador demo',next_action:'Revisar material',due_date:i<2?'2026-10-27':'2026-11-05',publication_status:i===4?'PUBLISHED':'PENDING',publication_url:i===4?'https://example.test/publicacion-demo':'',witness_key:'',witness_name:'',published_at:i===4?'2026-10-26T18:00:00Z':'',publication_registered_by:''});
 for(const subject of ['ESCALETA','CONTENIDO','COPY']){
 const rid=`DEMO-R${i+1}-${subject}`,rs=subject==='ESCALETA'&&i>0?'APPROVED':status;
 state.reviews.push({id:rid,external_review_id:rid,deliverable_id:did,subject,version:1,status:rs,url:'',body:subject==='CONTENIDO'?'':subject==='COPY'?'Texto ficticio: descubre nuestra colección de temporada. #Demostración':'Guion ficticio: presentación del producto, demostración de uso y cierre.',client_comment:rs==='CHANGES_REQUESTED'?'Mostrar el producto antes del cierre. Comentario ficticio.':'',operator_instruction:'',communicated_at:'',communicated_by:'',communicated_message:'',decision_at:rs==='CHANGES_REQUESTED'?'2026-10-28T12:00:00Z':'',decision_by:'cliente@example.test'});
 state.versions.push({id:`DEMO-V${i+1}-${subject}`,review_item_id:rid,review_id:rid,version:1,url:'',body:subject==='CONTENIDO'?'':'Material ficticio de demostración.',canonical_name:`AUR_00${i+1}_${subject}_V01`,drive_file_id:'',status:rs,comments:[]});
 }
}
export const agencies=[{id:'DEMO-A01',agency_name:'Agencia Prisma Demo',legal_name:'Agencia ficticia de demostración',representative_name:'Representante Ejemplo',representative_title:'LA SEÑORA',address:'Domicilio ficticio',rfc:'',status:'ACTIVA',notes:'Sólo demostración',created_at:'2026-10-20',updated_at:'2026-10-20'}];
export const contracts=[{id:'DEMO-K01',campaign_id:'DEMO-M01',campaign_name:'Nébula · Macro de demostración',talent_id:'DEMO-T01',talent_name:names[0],contract_variant:'AGENCY',contract_source:'PRISMO',agency_id:'DEMO-A01',agency_name:agencies[0].agency_name,representative_name:'Representante Ejemplo',brand:'Nébula Demo',amount_cents:2500000,amount:'25000',status:'GENERADO',commercial_status:'SIN DOCUMENTO',created_at:'2026-10-20',updated_at:'2026-10-28',start_date:'2026-11-01',end_date:'2026-11-30',description:'Dos contenidos ficticios para auditoría',deliverables:'2 reels de demostración',drive_document_id:'',commercial_drive_document_id:''}];
export const macroProfiles=[{campaign_id:'DEMO-M01',campaign_name:contracts[0].campaign_name,client_id:clients[0].id,client_name:clients[0].name,client_contact:'Contacto demo',confirmation_on:'2026-10-20',confirmation_reference:'DEMO',brand_name:'Nébula Demo',starts_on:'2026-11-01',ends_on:'2026-11-30',operations_status:'EN_PREPARACION',admin_status:'PENDIENTE',review_status:'PENDIENTE',operator_notes:'Datos ficticios',source:'DEMO',version:1,updated_at:'2026-10-28',updated_by:'operador@example.test',contract_count:1}];
export function fixture(path,role,scenario){
 let s=structuredClone(state);s.actor=role==='CLIENTE'?{email:'cliente@example.test',name:'Cliente de demostración',role}:s.actor;
 if(role==='CLIENTE'){s.campaigns=s.campaigns.slice(0,1);s.clients=[];s.client_access=[];s.agreements=[];s.talent_documents=[];}
 if(scenario==='empty')for(const k of Object.keys(s))if(Array.isArray(s[k]))s[k]=[];
 const empty=scenario==='empty';
 const responses={
 '/api/prismo':s,
 '/api/app-version':{id:'',version:'',deployment:null},
 '/api/message-templates':{templates:[]},
 '/api/talent-agencies':{agencies:empty?[]:agencies},
 '/api/talent-agency-contract':{campaigns:empty?[]:[contracts[0].campaign_name],contracts:empty?[]:contracts,contract:contracts[0],contractVersions:[],letterVersions:[]},
 '/api/macro-campaigns':{campaigns:empty?[]:macroProfiles,profiles:empty?[]:macroProfiles,clients,events:[],contracts:empty?[]:contracts},
 '/api/macro-commercial':{agreements:[],campaigns:[],contracts:empty?[]:contracts},
 '/api/macro-financial':{movements:[],documents:[]},
 '/api/macro-counterparties':{counterparties:[]},
 '/api/macro-identity':{identities:[],documents:[],reviews:[]},
 '/api/macro-talent-fiscal':{profiles:[],documents:[]},
 '/api/agency-dossier':{documents:[],reviews:[],requirements:[]},
 '/api/macro-counterparty-dossier':{documents:[],reviews:[]},
 '/api/campaign-shipping':{requiresProduct:false,acquisitionConfigured:true,documents:[]},
 };
 return responses[path];
}
