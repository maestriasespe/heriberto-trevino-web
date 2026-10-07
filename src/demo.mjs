// Estructuras de demostración. Ninguna ficha atribuye una obra, programa o logro real.
import {sections} from './config.mjs';
export const demoItems = sections.map((s, idx) => ({
  id: `00000000-0000-4000-8000-${String(idx + 1).padStart(12,'0')}`,
  kind: s.kind, slug: `vista-de-${s.path}`, title: ({obra:'Así se documentará cada obra',programa:'Así se documentará cada programa',evolucion:'Un mismo espacio, dos momentos',testimonio:'Un espacio para historias en primera persona',legislativo:'De la iniciativa a su resultado'})[s.kind],
  topic: 'Vista de estructura', year_start: null, year_end: null, role: '', location: '',
  summary: ({obra:'Fotografías, ubicación, participación, inversión y alcance en una misma ficha.',programa:'Objetivos, año, cargo, funcionamiento y resultados documentados.',evolucion:'Un comparador de fotografías con fecha, crédito y contexto.',testimonio:'Video, contexto y transcripción. La publicación requiere autorización.',legislativo:'Fecha, expediente, autoría, estado del trámite y fuentes oficiales.'})[s.kind],
  body: 'Esta es una ficha de demostración para revisar el diseño del sitio. No corresponde a una obra, programa, testimonio o resultado real.\n\nAl incorporar el expediente, aquí se explicarán los antecedentes, la participación acreditada y los resultados que respaldan los documentos. La información que no se haya comprobado aparecerá como no documentada.',
  participation: '', partners:'', investment_amount:null, investment_scope:'', investment_method:'', beneficiaries:null, beneficiary_unit:'personas', beneficiary_method:'',
  sources:[], details:{comparison_notes:'La comparación deberá corresponder al mismo espacio y señalar las fechas, las intervenciones de otros actores y las limitaciones de las imágenes.'},
  status:'draft',verification:'pending',is_demo:true,featured:true,updated_at:null,published_at:null,media:[]
}));
export const defaultSettings = {name:'Heriberto Treviño', portrait_path:null, portrait_alt:'Retrato profesional de Heriberto Treviño', portrait_credit:'', portrait_rights_confirmed:false, contact_email:'', privacy_notice:''};
