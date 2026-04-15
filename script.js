var API = 'api.php?action=';
var user = JSON.parse(localStorage.getItem('user') || 'null');
var allTickets = [];
function post(action, data, cb){
    var req = new XMLHttpRequest();
    req.open('POST', API + action, true);
    req.setRequestHeader('Content-type', 'application/json');
    req.onload = function(){ cb(JSON.parse(req.responseText)); };
    req.send(JSON.stringify(data));}
function get(action, cb){
    var req = new XMLHttpRequest();
    req.open('GET', API + action, true);
    req.onload = function(){ cb(JSON.parse(req.responseText)); };
    req.send();}
function findTicket(id){
    for(var i = 0; i < allTickets.length; i++)
        if(allTickets[i].id == id) return allTickets[i];
    return null;}
function checkAuth(roles){
    if(!user){ location.href = 'login.html'; return; }
    if(roles && roles.length && roles.indexOf(user.role) === -1){
        location.href = 'dashboard.html'; return;}
    document.body.style.display = 'block';}
function logout(){
    localStorage.clear();
    location.href = 'login.html';}
function loadTickets() {
    var req = new XMLHttpRequest();
    req.open("POST", "api.php?action=tickets", true);
    req.setRequestHeader("Content-type", "application/json");
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var tickets = JSON.parse(this.responseText);
            allTickets = tickets;
            var tbody = document.getElementById("tickets-tbody");
            if(!tbody) return;
            tbody.innerHTML = "";
            var url = window.location.href;
            var isAdminPage = url.indexOf("administration") > -1;
            var isDashboard = url.indexOf("dashboard") > -1;
            var showAction = (user.role == "admin" && isAdminPage) || (user.role == "support");
            var hideAction = !showAction;
            if(hideAction) {
                var table = tbody.parentElement;
                if(table) {
                    var headers = table.getElementsByTagName('th');
                    if(headers.length >= 6) {
                        headers[5].style.display = 'none';}}}
            for(var i = 0; i < tickets.length; i++) {
                var t = tickets[i];
                var date = new Date(t.created_at).toLocaleDateString();
                var ligne = "";
                var statusClass = 'status-' + t.status;
                var priorityClass = 'priority-' + t.priority;
                var statusBadge = '<span class="status-badge ' + statusClass + '">' + t.status + '</span>';
                var priorityBadge = '<span class="priority-badge ' + priorityClass + '">' + t.priority + '</span>';
                if(user.role == "admin" && isAdminPage) {
                    ligne += "<tr>";
                    ligne += "<td>" + t.title + "</td>";
                    ligne += "<td>" + statusBadge + "</td>";
                    ligne += "<td>" + priorityBadge + "</td>";
                    ligne += "<td>" + (t.creator || "-") + "</td>";
                    ligne += "<td>" + date + "</td>";
                    ligne += "<td>" + t.category + "</td>";
                    ligne += "<td>" + (t.support || "Non assigné") + "</td>";
                    ligne += "<td><button onclick='openAssign(" + t.id + ")' class='btn btn-primary'>Assigner</button></td>";
                    ligne += "</tr>";}
                else if(user.role == "support") {
                    ligne += "<tr>";
                    ligne += "<td>" + t.title + "</td>";
                    ligne += "<td>" + statusBadge + "</td>";
                    ligne += "<td>" + priorityBadge + "</td>";
                    ligne += "<td>" + date + "</td>";
                    ligne += "<td>" + t.category + "</td>";
                    ligne += "<td><button onclick='showSupportTicket(" + t.id + ")' class='btn btn-primary'>Voir</button></td>";
                    ligne += "</tr>";}
                else {
                    ligne += "<tr>";
                    ligne += "<td>" + t.title + "</td>";
                    ligne += "<td>" + statusBadge + "</td>";
                    ligne += "<td>" + priorityBadge + "</td>";
                    ligne += "<td>" + date + "</td>";
                    ligne += "<td>" + t.category + "</td>";
                    ligne += "</tr>";}
                tbody.innerHTML += ligne;}}};
    req.send(JSON.stringify({user: user}));}
function showSupportTicket(ticketId){
    var ticket = findTicket(ticketId);
    if(!ticket){ console.error('Ticket not found:', ticketId); return; }
    document.getElementById('support-modal-title').innerText = ticket.title || 'Sans titre';
    document.getElementById('support-modal-desc').innerText = ticket.description || 'Pas de description';
    var statusBadge = document.getElementById('support-modal-status');
    var priorityBadge = document.getElementById('support-modal-priority');
    statusBadge.innerText = ticket.status;
    statusBadge.className = 'status-badge status-' + ticket.status;
    priorityBadge.innerText = ticket.priority;
    priorityBadge.className = 'priority-badge priority-' + ticket.priority;
    var resolveBtn = document.getElementById('support-resolve-btn');
    var closeBtn = document.getElementById('support-close-btn');
    if(ticket.status == 'resolu'){
        resolveBtn.style.display = 'none';
        closeBtn.innerText = 'Déjà résolu ✓';
        closeBtn.style.background = '#059669';
        closeBtn.style.color = 'white';
        closeBtn.onclick = closeSupportModal;
    } else {
        resolveBtn.style.display = 'inline-block';
        resolveBtn.innerText = 'Marquer comme résolu';
        resolveBtn.onclick = function(){ resolveTicket(ticket.id); closeSupportModal(); };
        closeBtn.innerText = 'Fermer';
        closeBtn.style.background = '';
        closeBtn.style.color = '';
        closeBtn.onclick = closeSupportModal;}
    document.getElementById('support-modal').style.display = 'flex';}
function closeSupportModal(){
    document.getElementById('support-modal').style.display = 'none';}
function loadDetailedStats(){
    get('stats', function(s){
        var map = {
            'stat-total': s.total, 'stat-attente': s.en_attente, 'stat-cours': s.en_cours, 'stat-resolus': s.resolus, 'stat-urgents': s.urgents,
            'tot-ticket': s.total, 'en-attente': s.en_attente, 'en-cours': s.en_cours, 'resolus': s.resolus, 'urgents': s.urgents,
            'card-total': s.total, 'card-resolus': s.resolus, 'card-cours': s.en_cours, 'card-urgents': s.urgents};
        for(var id in map){
            var el = document.getElementById(id);
            if(el) el.innerHTML = map[id];}});}
function loadSupports(){
    get('supports', function(supports){
        var select = document.getElementById('technician-select');
        if(!select) return;
        var html = '<option value="">-- Choisir un technicien --</option>';
        for(var i = 0; i < supports.length; i++)
            html += '<option value="' + supports[i].id + '">' + supports[i].username + '</option>';
        select.innerHTML = html;});}
function openAssign(id){
    var ticket = findTicket(id);
    document.getElementById('assignment-modal').style.display = 'flex';
    document.getElementById('modal-ticket-title').innerText = ticket ? ticket.title : 'Ticket #' + id;
    document.getElementById('modal-ticket-desc').innerText = ticket ? (ticket.description || 'Pas de description') : '';
    loadSupports();
    document.getElementById('assign-btn').onclick = function(){
        var supId = document.getElementById('technician-select').value;
        if(!supId) return;
        post('assign', {ticket_id: id, support_id: supId}, function(){
            document.getElementById('assignment-modal').style.display = 'none';
            loadTickets();
            loadDetailedStats();});};
    document.getElementById('cancel-assign-btn').onclick = function(){
        document.getElementById('assignment-modal').style.display = 'none';};}
function resolveTicket(id){
    post('update-status', {ticket_id: id, status: 'resolu'}, function(){
        loadTickets();
        loadDetailedStats();});}
function toggleFAQ(el){
    var open = el.nextElementSibling.classList.toggle('active');
    el.querySelector('.faq-toggle').innerText = open ? '-' : '+';}
document.addEventListener('DOMContentLoaded', function(){
    var loginForm = document.getElementById('login-form');
    if(loginForm){
        loginForm.onsubmit = function(e){
            e.preventDefault();
            post('login', {username: document.getElementById('username').value, password: document.getElementById('password').value}, function(rep){
                if(rep.success){
                    localStorage.setItem('user', JSON.stringify(rep.user));
                    location.href = 'dashboard.html';
                } else {
                    var err = document.getElementById('login-error');
                    err.style.display = 'block';
                    err.innerText = 'Login invalid';}});};}
    var signupForm = document.getElementById('signup-form');
    if(signupForm){
        signupForm.onsubmit = function(e){
            e.preventDefault();
            if(document.getElementById('password').value !== document.getElementById('confirm_password').value){
                return;}
            var data = {};
            new FormData(signupForm).forEach(function(v, k){ data[k] = v; });
            post('signup', data, function(){
                location.href = 'login.html';});};}
    var ticketForm = document.getElementById('ticket-form');
    if(ticketForm){
        ticketForm.onsubmit = function(e){
            e.preventDefault();
            var data = {};
            new FormData(ticketForm).forEach(function(v, k){ data[k] = v; });
            data.user_id = user.id;
            post('create-ticket', data, function(){ location.href = 'dashboard.html'; });};}
    if(user && user.role == 'admin')
        document.querySelectorAll('.admin-only').forEach(function(l){ l.style.display = 'inline-block'; });
    loadTickets();
    loadDetailedStats();});
/* ===== Stats page ===== */
var catColors = ['#3769A6','#6594b1','#A2CB8B','#d97d55','#ea7b7b'];

function drawDonut(attente, cours, resolus) {
    var total = attente + cours + resolus;
    if(total === 0) return;
    var cx = 80, cy = 80, r = 60, sw = 22;
    var circ = 2 * Math.PI * r;
    var data = [
        { val: attente, color: '#cbd5e1' },
        { val: cours,   color: '#6594b1' },
        { val: resolus, color: '#A2CB8B' }
    ];
    var svg = document.getElementById('donut-svg');
    if(!svg) return;
    var old = svg.querySelectorAll('.seg');
    for(var i = 0; i < old.length; i++) old[i].remove();
    var offset = 0;
    for(var i = 0; i < data.length; i++) {
        var pct = data[i].val / total;
        var dash = pct * circ;
        var gap  = circ - dash;
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'seg');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', data[i].color);
        circle.setAttribute('stroke-width', sw);
        circle.setAttribute('stroke-dasharray', dash + ' ' + gap);
        circle.setAttribute('stroke-dashoffset', -offset * circ);
        circle.setAttribute('transform', 'rotate(-90 80 80)');
        svg.insertBefore(circle, svg.querySelector('text'));
        offset += pct;
    }
    document.getElementById('donut-center-val').textContent = total;
}

function drawPriorityBars(s) {
    var vals = {
        urgente: parseInt(s.urgente)||0,
        haute:   parseInt(s.haute)||0,
        moyenne: parseInt(s.moyenne)||0,
        ok:      parseInt(s.ok)||0
    };
    var max = Math.max(vals.urgente, vals.haute, vals.moyenne, vals.ok, 1);
    var keys = ['urgente','haute','moyenne','ok'];
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var pct = (vals[k] / max) * 100;
        var bar = document.getElementById('bar-' + k);
        var valEl = document.getElementById('val-' + k);
        if(bar) {
            (function(b, p, v, el) {
                setTimeout(function() {
                    b.style.width = p + '%';
                    el.textContent = v;
                }, 200);
            })(bar, pct, vals[k], valEl);
        }
    }
}

function drawCategoryBars(categories) {
    var container = document.getElementById('category-bars');
    if(!container) return;
    container.innerHTML = '';
    var keys = Object.keys(categories);
    var max = 1;
    for(var i = 0; i < keys.length; i++) {
        if(parseInt(categories[keys[i]]) > max) max = parseInt(categories[keys[i]]);
    }
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = parseInt(categories[k]) || 0;
        var pct = (v / max) * 100;
        var color = catColors[i % catColors.length];
        var row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML =
            '<div class="bar-label">' + k + '</div>' +
            '<div class="bar-track"><div class="bar-fill" style="width:0%;background:' + color + '" data-pct="' + pct + '">' +
            '<span>' + v + '</span></div></div>';
        container.appendChild(row);
    }
    setTimeout(function() {
        var fills = container.querySelectorAll('.bar-fill');
        for(var i = 0; i < fills.length; i++) {
            fills[i].style.width = fills[i].getAttribute('data-pct') + '%';
        }
    }, 300);
}

function loadStats() {
    var req = new XMLHttpRequest();
    req.open('GET', 'api.php?action=stats', true);
    req.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var s = JSON.parse(this.responseText);
            var total = parseInt(s.total) || 0;

            // Top stat cards
            var ids = {
                'stat-total': total,
                'stat-attente': parseInt(s.en_attente)||0,
                'stat-cours': parseInt(s.en_cours)||0,
                'stat-resolus': parseInt(s.resolus)||0,
                'stat-urgents': parseInt(s.urgents)||0
            };
            for(var id in ids) {
                var el = document.getElementById(id);
                if(el) el.innerHTML = ids[id];
            }

            // Donut legend
            var legAttente = document.getElementById('leg-attente');
            var legCours   = document.getElementById('leg-cours');
            var legResolus = document.getElementById('leg-resolus');
            if(legAttente) legAttente.textContent = parseInt(s.en_attente)||0;
            if(legCours)   legCours.textContent   = parseInt(s.en_cours)||0;
            if(legResolus) legResolus.textContent = parseInt(s.resolus)||0;

            // Rate cards
            var txRes  = total > 0 ? Math.round((parseInt(s.resolus)/total)*100) : 0;
            var txCours= total > 0 ? Math.round((parseInt(s.en_cours)/total)*100) : 0;
            var txUrg  = total > 0 ? Math.round((parseInt(s.urgents)/total)*100) : 0;
            var tauxRes = document.getElementById('taux-resolution');
            var tauxCours = document.getElementById('taux-cours');
            var tauxUrgents = document.getElementById('taux-urgents');
            if(tauxRes) tauxRes.textContent = txRes + '%';
            if(tauxCours) tauxCours.textContent = txCours + '%';
            if(tauxUrgents) tauxUrgents.textContent = txUrg + '%';

            // Charts
            drawDonut(parseInt(s.en_attente)||0, parseInt(s.en_cours)||0, parseInt(s.resolus)||0);
            drawPriorityBars(s);
            if(s.categories) drawCategoryBars(s.categories);
        }
    };
    req.send();
}

document.addEventListener('DOMContentLoaded', function() {
    if(document.getElementById('donut-svg')) loadStats();
});
