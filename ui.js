// ---- הודעות קופצות ודיאלוגים (מחליפים alert / confirm / prompt) ----
(function () {
    function box() {
        var b = document.getElementById('toastBox');
        if (!b) { b = document.createElement('div'); b.id = 'toastBox'; document.body.appendChild(b); }
        return b;
    }
    window.showToast = function (msg, type) {
        var t = document.createElement('div');
        t.className = 'toast' + (type ? ' ' + type : '');
        t.textContent = String(msg);
        var ms = Math.min(9000, 3500 + String(msg).length * 40);
        var timer = setTimeout(remove, ms);
        function remove() { clearTimeout(timer); if (t.parentNode) t.parentNode.removeChild(t); }
        t.onclick = remove;
        box().appendChild(t);
    };
    window.alert = function (msg) {
        var m = String(msg);
        var isErr = /שגיאה|נכשל|לא ניתן|אנא|שגוי|אזהרה|⚠/.test(m);
        var isOk = /בהצלחה|נשמר/.test(m);
        window.showToast(m, isErr ? 'err' : (isOk ? 'ok' : ''));
    };
    function dialog(msg, opts, withInput, def) {
        opts = opts || {};
        return new Promise(function (resolve) {
            var ov = document.createElement('div');
            ov.id = 'dlgOverlay';
            var d = document.createElement('div'); d.className = 'dlg';
            var m = document.createElement('div'); m.className = 'dlg-msg'; m.textContent = String(msg);
            d.appendChild(m);
            var inp = null;
            if (withInput) {
                inp = document.createElement('input');
                inp.type = opts.password ? 'password' : 'text';
                inp.value = def || '';
                inp.style.marginBottom = '10px';
                d.appendChild(inp);
            }
            var row = document.createElement('div'); row.className = 'dlg-btns';
            var ok = document.createElement('button'); ok.textContent = opts.ok || 'אישור'; ok.style.backgroundColor = '#1877f2';
            var no = document.createElement('button'); no.textContent = opts.cancel || 'ביטול'; no.style.backgroundColor = '#7f8c8d';
            function done(v) { if (ov.parentNode) ov.parentNode.removeChild(ov); resolve(v); }
            ok.onclick = function () { done(withInput ? inp.value : true); };
            no.onclick = function () { done(withInput ? null : false); };
            if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.click(); });
            row.appendChild(ok); row.appendChild(no); d.appendChild(row);
            ov.appendChild(d); document.body.appendChild(ov);
            if (inp) setTimeout(function () { inp.focus(); inp.select(); }, 50);
        });
    }
    window.appConfirm = function (msg, opts) { return dialog(msg, opts, false); };
    window.appPrompt = function (msg, def, opts) { return dialog(msg, opts, true, def); };
})();
    

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('sw.js').catch(function () {});
            });
        }
    

(function(){
    var open=false;
    window.openImageViewer=function(url){
        if(!url) return;
        document.getElementById('imgViewerImg').src=url;
        document.getElementById('imgViewerOverlay').classList.remove('hidden');
        if(!open){ open=true; try{ history.pushState({imgViewer:1},''); }catch(e){} }
    };
    function hide(){
        document.getElementById('imgViewerOverlay').classList.add('hidden');
        document.getElementById('imgViewerImg').src='';
        open=false;
    }
    window.closeImageViewer=function(){
        if(open){ open=false; try{ history.back(); return; }catch(e){} }
        hide();
    };
    window.addEventListener('popstate',function(){ if(!document.getElementById('imgViewerOverlay').classList.contains('hidden')) hide(); });
})();

// ---- כרטיסים מתקפלים ----
(function () {
    var KEY = 'invoices_folded_cards_v1';
    function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
    function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
    function init() {
        var main = document.getElementById('mainView');
        if (!main || main.dataset.foldInit) return;
        main.dataset.foldInit = '1';
        var state = load();
        var cards = [];
        Array.prototype.forEach.call(main.children, function (card) {
            if (!card.classList.contains('card')) return;
            var h = card.firstElementChild;
            if (!h || h.tagName !== 'H3') return;
            var key = h.textContent.trim().slice(0, 40);
            var body = document.createElement('div');
            body.className = 'card-body';
            while (h.nextSibling) body.appendChild(h.nextSibling);
            card.appendChild(body);
            card.classList.add('foldable');
            // ברירת מחדל: מקופל. אם המשתמש פתח פעם - זוכרים
            if (state[key] !== 'open') card.classList.add('folded');
            h.setAttribute('role', 'button');
            h.addEventListener('click', function () {
                var folded = card.classList.toggle('folded');
                var st = load(); st[key] = folded ? 'closed' : 'open'; save(st);
            });
            cards.push({ card: card, key: key });
        });
        if (!cards.length) return;
        var tools = document.createElement('div');
        tools.className = 'fold-tools';
        function setAll(fold) {
            var st = load();
            cards.forEach(function (c) { c.card.classList.toggle('folded', fold); st[c.key] = fold ? 'closed' : 'open'; });
            save(st);
        }
        var b1 = document.createElement('button'); b1.textContent = '⬇ פתח הכול'; b1.onclick = function () { setAll(false); };
        var b2 = document.createElement('button'); b2.textContent = '⬆ סגור הכול'; b2.onclick = function () { setAll(true); };
        tools.appendChild(b1); tools.appendChild(b2);
        main.insertBefore(tools, main.firstElementChild);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
