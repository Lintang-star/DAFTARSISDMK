const C=window.CONFIG,$=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const waL=(n,t='')=>'https://wa.me/'+String(n).replace(/\D/g,'').replace(/^0/,'62')+(t?'?text='+encodeURIComponent(t):'');
const fmt=t=>t?new Date(t).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'-';
const KEC=['Babakan Madang','Bojonggede','Caringin','Cariu','Ciampea','Ciawi','Cibinong','Cibungbulang','Cigombong','Cigudeg','Cijeruk','Cileungsi','Ciomas','Cisarua','Ciseeng','Citeureup','Dramaga','Gunung Putri','Gunung Sindur','Jasinga','Jonggol','Kemang','Klapanunggal','Leuwiliang','Leuwisadeng','Megamendung','Nanggung','Pamijahan','Parung','Parungpanjang','Rancabungur','Rumpin','Sukajaya','Sukamakmur','Sukaraja','Tajurhalang','Tamansari','Tanjungsari','Tenjo','Tenjolaya'];

// ===== Definisi form (sesuai template pengajuan) =====
const f=(k,l,t='text',o)=>[k,l,t,o];
const A=[f('pemilik','Pemilik'),f('alamat','Alamat','textarea'),f('desa','Desa/Kelurahan'),f('kec','Kecamatan','kec'),f('telp','Telepon','tel'),f('email','Email','email')];
const P=[f('pj','Nama Penanggung Jawab (Pj)'),f('pic','Nama PIC SISDMK'),f('wa','No. WhatsApp PIC','tel')];
const RG=f('regfas','Kode registrasi fasyankes');
const TYPES={
 klinik:{label:'Klinik',f:[RG,f('nama','Nama klinik'),f('jenis','Jenis','select',['Klinik Pratama','Klinik Utama']),f('tipe','Type (mis. Rawat Jalan / Rawat Inap)'),...A,f('izin','Nomor izin operasional'),f('izin_tgl','Tgl berlaku izin','date'),...P]},
 pm:{label:'Praktik Mandiri',f:[RG,f('nama','Nama praktik mandiri'),...A,f('sip','Nomor SIP'),f('sip_tgl','Tgl berlaku SIP','date'),...P]},
 apotek:{label:'Apotek',f:[f('nama','Nama apotek'),...A,f('sipa','SIP/SIPA'),f('sio','Nomor SIO'),f('sio_tgl','Tgl berlaku SIO','date'),...P]},
 perusahaan:{label:'Perusahaan',f:[f('nama','Nama perusahaan'),f('produk','Produk yang dihasilkan'),...A,f('sipa','SIP/SIPA'),f('sio','Nomor SIO/NIB'),f('sio_tgl','Tgl berlaku SIO/NIB','date'),...P]},
 optik:{label:'Optik',f:[f('nama','Nama optik'),...A,f('sip','Nomor SIP'),f('sip_tgl','Tgl berlaku SIP','date'),f('sio','Nomor SIO'),f('sio_tgl','Tgl berlaku SIO','date'),...P]}};
const STEPS=[
 ['diterima','Pengajuan diterima','Data masuk dan menunggu pemeriksaan admin.'],
 ['verifikasi','Verifikasi data','Admin memeriksa kelengkapan dan kesesuaian data.'],
 ['dibuat','Akun SISDMK dibuat','Akun jadi dalam 1 hari. User ID & password dikirim via WhatsApp.'],
 ['satusehat','Sinkronisasi SatuSehat','Akun muncul di SatuSehat Kemenkes 1x24 jam setelah pendaftaran dan aktivasi.'],
 ['selesai','Selesai','Akun siap digunakan.']];
const SL=Object.fromEntries([...STEPS.map(s=>[s[0],s[1]]),['perbaikan','Perlu perbaikan']]);

// ===== API (Google Apps Script) + mode demo =====
const L=(k,v)=>v===undefined?JSON.parse(localStorage.getItem(k)||'[]'):localStorage.setItem(k,JSON.stringify(v));
async function demo(a,b){
 const R=L('d_reg'),l4=s=>String(s||'').replace(/\D/g,'').slice(-4),uid=p=>p+'-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000);
 if(a==='submit'){const o={id:uid('REG'),dibuat:Date.now(),tipe:b.tipe,nama:b.nama,wa:b.wa,status:'diterima',userId:'',catatan:'',dibuatAt:0,data:b.data,log:[{t:Date.now(),s:'diterima',n:''}]};R.push(o);L('d_reg',R);return{ok:true,id:o.id}}
 if(a==='track'){const o=R.find(x=>x.id===String(b.id).trim().toUpperCase()&&l4(x.wa)===l4(b.wa4));return o?{ok:true,item:{id:o.id,nama:o.nama,tipe:o.tipe,status:o.status,catatan:o.catatan,dibuat:o.dibuat,dibuatAt:o.dibuatAt,log:o.log}}:{ok:false,error:'Data tidak ditemukan. Periksa ID tiket dan 4 digit terakhir WhatsApp.'}}
 if(a==='help'){const h=L('d_help'),id=uid('HD');h.push({id,t:Date.now(),...b.data});L('d_help',h);return{ok:true,id}}
 if(b.token!=='demo')return{ok:false,error:'Token salah (mode demo: gunakan "demo").'};
 if(a==='admin_list')return{ok:true,items:R,pw:'(PASSWORD_DEFAULT)'};
 if(a==='admin_update'){const o=R.find(x=>x.id===b.id);if(!o)return{ok:false,error:'ID tidak ditemukan'};Object.assign(o,{status:b.status,userId:b.userId||'',catatan:b.catatan||''});if(b.status==='dibuat'&&!o.dibuatAt)o.dibuatAt=Date.now();o.log.push({t:Date.now(),s:b.status,n:b.catatan||''});L('d_reg',R);return{ok:true}}
}
const API={async call(action,data){
 if(!C.API_URL)return demo(action,data);
 try{const r=await fetch(C.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data})});return await r.json()}
 catch(e){return{ok:false,error:'Gagal terhubung ke server. Coba lagi.'}}}};

// ===== Layout =====
function layout(){
 const pg=[['index','Beranda'],['daftar','Daftar Akun'],['pantau','Pantau Akun'],['info','Info SISDMK'],['helpdesk','Helpdesk']],cur=document.body.dataset.page;
 $('#nav').innerHTML=`<header class="top"><a class="brand" href="index.html">🏥 <b>SISDMK</b> Kab. Bogor</a><nav>${pg.map(([p,l])=>`<a href="${p}.html" class="${p===cur?'on':''}">${l}</a>`).join('')}</nav></header>`+(C.API_URL?'':'<div class="note warn" style="text-align:center;margin:0">Mode demo: data hanya tersimpan di browser ini. Isi API_URL di assets/config.js untuk menyimpan ke Google Sheets.</div>');
 $('#foot').innerHTML=`<footer><b>${esc(C.INSTANSI)}</b><br>${esc(C.ALAMAT)} · Telp ${esc(C.TELP)}<br>WhatsApp info: <a href="${waL(C.WA_INFO)}">${esc(C.WA_INFO)}</a></footer>`;
}

// ===== Halaman =====
function index(){$('#alur').innerHTML='<ol>'+STEPS.map(s=>`<li><b>${s[1]}</b>: ${s[2]}</li>`).join('')+'</ol>'}

const inp=([k,l,t,o])=>{const n=`name="${k}" required`;let h;
 if(t==='textarea')h=`<textarea ${n} rows="2"></textarea>`;
 else if(t==='kec'||t==='select')h=`<select ${n}><option value="">Pilih…</option>${(t==='kec'?KEC:o).map(x=>`<option>${x}</option>`).join('')}</select>`;
 else h=`<input ${n} type="${t}"${t==='tel'?' inputmode="tel"':''}>`;
 return `<label class="${t==='textarea'?'full':''}">${l}${h}</label>`};

function daftar(){
 const s=$('#tipe'),box=$('#fields');
 s.innerHTML=Object.entries(TYPES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');
 const draw=()=>box.innerHTML=TYPES[s.value].f.map(inp).join('');
 s.onchange=draw;draw();
 $('#fd').onsubmit=async e=>{e.preventDefault();
  const d=Object.fromEntries(new FormData(e.target));delete d.tipe_faskes;
  if(!/^(\+?62|0)8\d{7,12}$/.test(String(d.wa).replace(/[\s-]/g,'')))return alert('Nomor WhatsApp tidak valid (contoh: 08123456789).');
  const btn=$('#kirim');btn.disabled=true;btn.textContent='Mengirim…';
  const r=await API.call('submit',{tipe:s.value,nama:d.nama,wa:d.wa,data:d});
  btn.disabled=false;btn.textContent='Kirim Pengajuan';
  $('#hasil').innerHTML=r.ok?`<div class="card"><h2>✅ Pengajuan terkirim</h2><p>Simpan ID tiket berikut untuk memantau akun:</p><p style="font-size:24px"><b>${esc(r.id)}</b></p><p>Akun SISDMK dibuat dalam 1 hari. Akun akan muncul di SatuSehat 1x24 jam setelah pendaftaran dan aktivasi. User ID dikirim ke WhatsApp PIC.</p><a class="btn" href="pantau.html?id=${encodeURIComponent(r.id)}">Pantau sekarang</a></div>`:`<p class="note warn">${esc(r.error)}</p>`;
  if(r.ok){e.target.reset();draw();$('#hasil').scrollIntoView({behavior:'smooth'})}};
}

function pantau(){
 const q=new URLSearchParams(location.search);if(q.get('id'))document.querySelector('[name=id]').value=q.get('id');
 $('#fp').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),h=$('#hasil');h.innerHTML='<p class="m">Memuat…</p>';
  const r=await API.call('track',{id:d.id,wa4:d.wa4});
  if(!r.ok){h.innerHTML=`<p class="note warn">${esc(r.error)}</p>`;return}
  const i=r.item,idx=i.status==='selesai'?5:i.status==='perbaikan'?1:STEPS.findIndex(s=>s[0]===i.status);
  const eta=['diterima','verifikasi','perbaikan'].includes(i.status)?['Estimasi akun SISDMK jadi',i.dibuat+864e5]:['Estimasi muncul di SatuSehat',(i.dibuatAt||i.dibuat)+864e5];
  h.innerHTML=`<div class="card"><h2>${esc(i.nama)} <span class="tag ${i.status==='perbaikan'?'w':''}">${SL[i.status]}</span></h2><p class="m">${esc(i.id)} · ${TYPES[i.tipe]?.label||''} · diajukan ${fmt(i.dibuat)}</p>
  ${i.status==='perbaikan'?`<p class="note warn">Data tidak sesuai/tidak valid. Silakan hubungi admin SDMK: <a href="${waL(C.WA_ADMIN)}">${esc(C.WA_ADMIN)}</a></p>`:''}
  ${i.catatan?`<p class="note"><b>Catatan admin:</b> ${esc(i.catatan)}</p>`:''}
  ${i.status!=='selesai'?`<p class="note">${eta[0]}: <b>${fmt(eta[1])}</b></p>`:''}
  ${STEPS.map((s,n)=>`<div class="step ${n<idx?'done':n===idx?'now':''}"><div class="dot">${n<idx?'✓':n+1}</div><div><b>${s[1]}</b><br><span class="m">${s[2]}</span></div></div>`).join('')}
  <h3>Riwayat</h3><ul>${(i.log||[]).slice().reverse().map(l=>`<li>${fmt(l.t)}: ${SL[l.s]||l.s}${l.n?' — '+esc(l.n):''}</li>`).join('')}</ul></div>`};
 if(q.get('id'))$('#fp').querySelector('[name=wa4]').focus();
}

function helpdesk(){
 $('#fh').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
  const r=await API.call('help',{data:d});
  $('#hr').innerHTML=r.ok?`<p class="note">Keluhan terkirim. Nomor tiket: <b>${esc(r.id)}</b>. Admin akan menghubungi lewat WhatsApp.</p>`:`<p class="note warn">${esc(r.error)}</p>`;
  if(r.ok)e.target.reset()};
}

function admin(){
 let items=[],pw='',tok=sessionStorage.getItem('tok')||'';const dlg=$('#dlg'),box=$('#adm');
 $('#ft').onsubmit=e=>{e.preventDefault();tok=e.target.token.value;load()};
 if(tok)load();
 async function load(){const r=await API.call('admin_list',{token:tok});if(!r.ok){$('#msg').textContent=r.error;sessionStorage.removeItem('tok');return}
  sessionStorage.setItem('tok',tok);items=r.items;pw=r.pw;$('#ft').hidden=true;$('#msg').textContent='';draw()}
 function draw(flt=''){
  const cnt=k=>items.filter(x=>x.status===k).length,list=items.filter(x=>!flt||x.status===flt).sort((a,b)=>b.dibuat-a.dibuat);
  box.innerHTML=`<div class="grid">${Object.entries(SL).map(([k,v])=>`<div class="card"><div class="m">${v}</div><b style="font-size:28px">${cnt(k)}</b></div>`).join('')}</div>
  <label>Filter status<select id="flt"><option value="">Semua (${items.length})</option>${Object.entries(SL).map(([k,v])=>`<option value="${k}" ${k===flt?'selected':''}>${v}</option>`).join('')}</select></label>
  <div class="scroll card"><table><tr><th>ID</th><th>Tanggal</th><th>Jenis</th><th>Faskes</th><th>Status</th><th></th></tr>${list.map(o=>`<tr><td>${esc(o.id)}</td><td>${fmt(o.dibuat)}</td><td>${TYPES[o.tipe]?.label||''}</td><td>${esc(o.nama)}</td><td><span class="tag ${o.status==='perbaikan'?'w':''}">${SL[o.status]}</span></td><td><button class="btn alt" data-id="${esc(o.id)}">Kelola</button></td></tr>`).join('')||'<tr><td colspan="6">Belum ada data.</td></tr>'}</table></div>`;
  $('#flt').onchange=e=>draw(e.target.value);
  box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>open(b.dataset.id));
 }
 function open(id){
  const o=items.find(x=>x.id===id),T=TYPES[o.tipe]||{label:'',f:[]},lab=Object.fromEntries(T.f.map(x=>[x[0],x[1]])),v=n=>dlg.querySelector(`[name=${n}]`).value;
  dlg.innerHTML=`<h3>${esc(o.id)} · ${T.label}</h3><div class="scroll"><table>${Object.entries(o.data||{}).map(([k,x])=>`<tr><th>${esc(lab[k]||k)}</th><td>${esc(x)}</td></tr>`).join('')}</table></div>
  <div class="f"><label>Status<select name="status">${Object.entries(SL).map(([k,x])=>`<option value="${k}" ${k===o.status?'selected':''}>${x}</option>`).join('')}</select></label>
  <label>User ID SISDMK<input name="userId" value="${esc(o.userId)}"></label>
  <label class="full">Catatan (terlihat oleh pemohon)<textarea name="catatan" rows="2">${esc(o.catatan)}</textarea></label></div>
  <p><button class="btn" id="sv">Simpan</button><button class="btn alt" id="cl">Tutup</button></p>
  <p class="m">Balas via WhatsApp ke ${esc(o.wa)}:</p>
  <button class="btn alt" data-m="a">Akun dibuat</button><button class="btn alt" data-m="b">Data tidak valid</button><button class="btn alt" data-m="c">Nama pemohon ≠ faskes</button>`;
  const M={
   a:()=>`AKUN SISDMK ${T.label.toUpperCase()} ${o.nama}\n${C.SISDMK_URL}\nUser Id : ${v('userId')}\nPassword : ${pw}\nSilahkan login dan lakukan pergantian password setelah login\n1x24 jam akun aktif di satusehat`,
   b:()=>`Data tidak sesuai/tidak valid.${v('catatan')?' '+v('catatan')+'.':''} Silahkan wa admin sdmk: ${C.WA_ADMIN}`,
   c:()=>`Nama pemohon berbeda dengan nama faskes. Info wa ${C.WA_INFO}`};
  dlg.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>window.open(waL(o.wa,M[b.dataset.m]()),'_blank'));
  $('#cl').onclick=()=>dlg.close();
  $('#sv').onclick=async()=>{const r=await API.call('admin_update',{token:tok,id:o.id,status:v('status'),userId:v('userId'),catatan:v('catatan')});
   if(!r.ok)return alert(r.error);dlg.close();load()};
  dlg.showModal();
 }
}

layout();
({index,daftar,pantau,helpdesk,admin}[document.body.dataset.page]||(()=>{}))();
if(document.body.dataset.page==='helpdesk'){const s=(i,h)=>{const e=document.getElementById(i);if(e)e.href=h};s('w1',waL(C.WA_INFO));s('w2',waL(C.WA_ADMIN));s('w3',C.FORM_ASISTEN)}
