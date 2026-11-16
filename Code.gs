// Backend Google Apps Script. Tempel di Extensions > Apps Script pada Google Sheet.
const ADMIN_TOKEN = 'GANTI_DENGAN_TOKEN_RAHASIA';
const DEFAULT_PW  = 'Sisdmk@123';   // password awal akun, hanya dikirim ke panel admin
const H1 = ['id','dibuat','tipe','nama','wa','status','userId','catatan','dibuatAt','updated','data','log'];
const H2 = ['id','waktu','nama','profesi','nik','str','sip','faskes','wa','keluhan'];
const OK_STATUS = ['diterima','verifikasi','perbaikan','dibuat','satusehat','selesai'];

function sheet_(n,h){const ss=SpreadsheetApp.getActive();let s=ss.getSheetByName(n);if(!s){s=ss.insertSheet(n);s.appendRow(h)}return s}
function rows_(s){const v=s.getDataRange().getValues(),h=v.shift();return v.map((r,i)=>{const o={_row:i+2};h.forEach((k,j)=>o[k]=r[j]);return o})}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function id_(p){return p+'-'+Utilities.formatDate(new Date(),'Asia/Jakarta','yyyyMMdd')+'-'+Math.floor(1000+Math.random()*9000)}
function l4_(s){return String(s||'').replace(/\D/g,'').slice(-4)}
function auth_(b){if(b.token!==ADMIN_TOKEN)throw new Error('Token admin salah')}

function doPost(e){
  try{
    const b=JSON.parse(e.postData.contents);
    const fn={submit,track,help,admin_list,admin_update}[b.action];
    if(!fn)return out_({ok:false,error:'Aksi tidak dikenal'});
    return out_(fn(b));
  }catch(err){return out_({ok:false,error:String(err.message||err)})}
}

function submit(b){
  if(!b.tipe||!b.nama||!b.wa||!b.data)throw new Error('Data tidak lengkap');
  const json=JSON.stringify(b.data);if(json.length>20000)throw new Error('Data terlalu besar');
  const id=id_('REG'),now=Date.now();
  sheet_('Pengajuan',H1).appendRow([id,now,b.tipe,b.nama,"'"+b.wa,'diterima','','',0,now,json,JSON.stringify([{t:now,s:'diterima',n:''}])]);
  return {ok:true,id};
}

function track(b){
  const o=rows_(sheet_('Pengajuan',H1)).find(x=>x.id===String(b.id).trim().toUpperCase()&&l4_(x.wa)===l4_(b.wa4));
  if(!o)return {ok:false,error:'Data tidak ditemukan. Periksa ID tiket dan 4 digit terakhir WhatsApp.'};
  return {ok:true,item:{id:o.id,nama:o.nama,tipe:o.tipe,status:o.status,catatan:o.catatan,dibuat:o.dibuat,dibuatAt:o.dibuatAt,log:JSON.parse(o.log||'[]')}};
}

function help(b){
  const d=b.data||{};if(!d.nama||!d.keluhan)throw new Error('Data tidak lengkap');
  const id=id_('HD');
  sheet_('Helpdesk',H2).appendRow([id,Date.now(),d.nama,d.profesi,"'"+d.nik,"'"+(d.str||''),"'"+(d.sip||''),d.faskes,"'"+(d.wa||''),d.keluhan]);
  return {ok:true,id};
}

function admin_list(b){
  auth_(b);
  const items=rows_(sheet_('Pengajuan',H1)).map(o=>{delete o._row;o.data=JSON.parse(o.data||'{}');o.log=JSON.parse(o.log||'[]');o.wa=String(o.wa);return o});
  return {ok:true,items,pw:DEFAULT_PW};
}

function admin_update(b){
  auth_(b);
  if(OK_STATUS.indexOf(b.status)<0)throw new Error('Status tidak valid');
  const s=sheet_('Pengajuan',H1),o=rows_(s).find(x=>x.id===b.id);
  if(!o)throw new Error('ID tidak ditemukan');
  const now=Date.now(),log=JSON.parse(o.log||'[]');
  log.push({t:now,s:b.status,n:b.catatan||''});
  o.status=b.status;o.userId=b.userId||'';o.catatan=b.catatan||'';o.updated=now;o.log=JSON.stringify(log);
  if(b.status==='dibuat'&&!o.dibuatAt)o.dibuatAt=now;
  o.wa="'"+o.wa;
  s.getRange(o._row,1,1,H1.length).setValues([H1.map(k=>o[k])]);
  return {ok:true};
}
