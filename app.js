import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const STORAGE_KEY = "cat-health-prototype-v1";

const SAMPLE_DATA = {
  sampleDataIncluded: true,
  cats: [
    { id: "cat-1", name: "もなか", age: 3, gender: "♀", emoji: "🐱", memo: "食欲は安定" , source: "sample"},
    { id: "cat-2", name: "あんこ", age: 7, gender: "♂", emoji: "🐈‍⬛", memo: "尿量を観察中", source: "sample" },
  ],
  records: [
    { id: "rec-1", catId: "cat-1", date: offsetDate(-3), food: 68, water: 180, poop: 1, pee: 3, note: "いつも通り", source: "sample" },
    { id: "rec-2", catId: "cat-1", date: offsetDate(-1), food: 72, water: 190, poop: 2, pee: 3, note: "やや元気", source: "sample" },
    { id: "rec-3", catId: "cat-2", date: offsetDate(-2), food: 56, water: 170, poop: 1, pee: 2, note: "落ち着いている", source: "sample" },
    { id: "rec-4", catId: "cat-2", date: isoToday(), food: 60, water: 210, poop: 1, pee: 3, note: "よく飲んだ", source: "sample" },
  ],
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_DATA;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.cats) || !Array.isArray(parsed.records)) return SAMPLE_DATA;
    return parsed;
  } catch {
    return SAMPLE_DATA;
  }
}

function validateCat(input) {
  const errors = {};
  const age = Number(input.age);
  if (!input.name?.trim()) errors.name = "名前は必須です";
  else if (input.name.trim().length > 20) errors.name = "名前は20文字以内です";

  if (!Number.isInteger(age) || age < 0 || age > 30) errors.age = "年齢は0〜30の整数で入力してください";
  if (!["♀", "♂", "不明"].includes(input.gender)) errors.gender = "性別を選択してください";
  return errors;
}

function validateRecord(input, catIds) {
  const errors = {};
  const food = Number(input.food);
  const water = Number(input.water);
  const poop = Number(input.poop);
  const pee = Number(input.pee);

  if (!catIds.includes(input.catId)) errors.catId = "猫を選択してください";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date || "")) errors.date = "日付は必須です";
  if (!Number.isFinite(food) || food < 0 || food > 500) errors.food = "ごはん量は0〜500g";
  if (!Number.isFinite(water) || water < 0 || water > 2000) errors.water = "飲水量は0〜2000ml";
  if (!Number.isInteger(poop) || poop < 0 || poop > 10) errors.poop = "0〜10回";
  if (!Number.isInteger(pee) || pee < 0 || pee > 10) errors.pee = "0〜10回";
  return errors;
}

function App() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState("home");
  const [selectedCatId, setSelectedCatId] = useState(data.cats[0]?.id || "");

  const [catForm, setCatForm] = useState({ id: null, name: "", age: "", gender: "♀", emoji: "🐱", memo: "" });
  const [catErrors, setCatErrors] = useState({});

  const [recordForm, setRecordForm] = useState({ id: null, catId: selectedCatId || "", date: isoToday(), food: 70, water: 200, poop: 1, pee: 3, note: "" });
  const [recordErrors, setRecordErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!data.cats.some((c) => c.id === selectedCatId)) {
      const fallback = data.cats[0]?.id || "";
      setSelectedCatId(fallback);
      setRecordForm((prev) => ({ ...prev, catId: fallback }));
    }
  }, [data.cats, selectedCatId]);

  const recordsByDateDesc = useMemo(
    () => [...data.records].sort((a, b) => b.date.localeCompare(a.date)),
    [data.records],
  );

  const today = isoToday();

  const catsWithStatus = useMemo(
    () =>
      data.cats.map((cat) => ({
        ...cat,
        doneToday: data.records.some((r) => r.catId === cat.id && r.date === today),
      })),
    [data.cats, data.records, today],
  );

  function startEditCat(cat) {
    setCatForm({ ...cat, age: String(cat.age), id: cat.id });
    setCatErrors({});
  }

  function clearCatForm() {
    setCatForm({ id: null, name: "", age: "", gender: "♀", emoji: "🐱", memo: "" });
    setCatErrors({});
  }

  function saveCat(e) {
    e.preventDefault();
    const errors = validateCat(catForm);
    setCatErrors(errors);
    if (Object.keys(errors).length) return;

    const normalized = {
      id: catForm.id || uid("cat"),
      name: catForm.name.trim(),
      age: Number(catForm.age),
      gender: catForm.gender,
      emoji: catForm.emoji || "🐱",
      memo: catForm.memo?.trim() || "",
      source: catForm.source || "user",
    };

    setData((prev) => {
      const exists = prev.cats.some((c) => c.id === normalized.id);
      const cats = exists ? prev.cats.map((c) => (c.id === normalized.id ? normalized : c)) : [normalized, ...prev.cats];
      return { ...prev, cats };
    });

    if (!selectedCatId) setSelectedCatId(normalized.id);
    clearCatForm();
  }

  function deleteCat(catId) {
    if (!window.confirm("この猫プロフィールを削除しますか？関連する記録も削除されます。")) return;
    setData((prev) => ({
      ...prev,
      cats: prev.cats.filter((c) => c.id !== catId),
      records: prev.records.filter((r) => r.catId !== catId),
    }));
  }

  function startEditRecord(record) {
    setRecordForm({ ...record, id: record.id });
    setRecordErrors({});
    setTab("records");
  }

  function clearRecordForm() {
    setRecordForm({ id: null, catId: data.cats[0]?.id || "", date: isoToday(), food: 70, water: 200, poop: 1, pee: 3, note: "" });
    setRecordErrors({});
  }

  function saveRecord(e) {
    e.preventDefault();
    const errors = validateRecord(recordForm, data.cats.map((c) => c.id));
    setRecordErrors(errors);
    if (Object.keys(errors).length) return;

    const normalized = {
      ...recordForm,
      id: recordForm.id || uid("rec"),
      food: Number(recordForm.food),
      water: Number(recordForm.water),
      poop: Number(recordForm.poop),
      pee: Number(recordForm.pee),
      note: recordForm.note?.trim() || "",
      source: recordForm.source || "user",
    };

    setData((prev) => {
      const exists = prev.records.some((r) => r.id === normalized.id);
      const records = exists
        ? prev.records.map((r) => (r.id === normalized.id ? normalized : r))
        : [normalized, ...prev.records];
      return { ...prev, records };
    });

    clearRecordForm();
  }

  function deleteRecord(recordId) {
    if (!window.confirm("この日次記録を削除しますか？")) return;
    setData((prev) => ({ ...prev, records: prev.records.filter((r) => r.id !== recordId) }));
  }

  function resetAll() {
    if (!window.confirm("すべてのデータ（猫プロフィール・記録）を削除します。よろしいですか？")) return;
    const empty = { cats: [], records: [], sampleDataIncluded: false };
    setData(empty);
    setSelectedCatId("");
    clearCatForm();
    clearRecordForm();
  }

  function removeSampleData() {
    if (!window.confirm("サンプルデータのみ削除しますか？")) return;
    setData((prev) => ({
      ...prev,
      sampleDataIncluded: false,
      cats: prev.cats.filter((c) => c.source !== "sample"),
      records: prev.records.filter((r) => r.source !== "sample"),
    }));
  }

  const selectedCatName = data.cats.find((c) => c.id === recordForm.catId)?.name;

  return (
    <div className="app">
      <header className="header">
        <h1>にゃん・ノート</h1>
        <p>1週間運用できる健康管理プロトタイプ</p>
      </header>

      <nav className="tabs" aria-label="ナビゲーション">
        {[
          ["home", "ホーム"],
          ["cats", "猫プロフィール"],
          ["records", "日次記録"],
          ["settings", "設定"],
        ].map(([key, label]) => (
          <button key={key} className={`tab-btn ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="container">
        {tab === "home" && (
          <section className="card">
            <h2>今日の記録状況（{today}）</h2>
            {catsWithStatus.length === 0 ? (
              <p className="muted">猫プロフィールを追加すると、ここに表示されます。</p>
            ) : (
              <ul className="list">
                {catsWithStatus.map((cat) => (
                  <li key={cat.id} className="list-item">
                    <div>
                      <strong>{cat.emoji} {cat.name}</strong>
                      <div className="muted">{cat.age}歳 / {cat.gender}</div>
                    </div>
                    <span className={`status ${cat.doneToday ? "done" : "pending"}`}>
                      {cat.doneToday ? "記録済み" : "未記録"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <h3>最新記録（新しい順）</h3>
            {recordsByDateDesc.length === 0 ? (
              <p className="muted">まだ記録がありません。</p>
            ) : (
              <ul className="stack">
                {recordsByDateDesc.slice(0, 8).map((r) => (
                  <li key={r.id} className="row">
                    <span>{r.date}</span>
                    <span>{data.cats.find((c) => c.id === r.catId)?.name || "削除済み"}</span>
                    <span>{r.food}g / 水{r.water}ml / 💩{r.poop} / 🚽{r.pee}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "cats" && (
          <>
            <section className="card">
              <h2>{catForm.id ? "猫プロフィール編集" : "猫プロフィール追加"}</h2>
              <form onSubmit={saveCat} className="form-grid">
                <label>名前<input value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} /></label>
                {catErrors.name && <p className="error">{catErrors.name}</p>}

                <label>年齢<input type="number" value={catForm.age} onChange={(e) => setCatForm((p) => ({ ...p, age: e.target.value }))} /></label>
                {catErrors.age && <p className="error">{catErrors.age}</p>}

                <label>性別
                  <select value={catForm.gender} onChange={(e) => setCatForm((p) => ({ ...p, gender: e.target.value }))}>
                    <option value="♀">♀</option><option value="♂">♂</option><option value="不明">不明</option>
                  </select>
                </label>
                {catErrors.gender && <p className="error">{catErrors.gender}</p>}

                <label>アイコン（絵文字）<input value={catForm.emoji} onChange={(e) => setCatForm((p) => ({ ...p, emoji: e.target.value }))} /></label>
                <label>メモ<textarea rows="2" value={catForm.memo} onChange={(e) => setCatForm((p) => ({ ...p, memo: e.target.value }))} /></label>

                <div className="actions">
                  <button type="submit">{catForm.id ? "更新" : "追加"}</button>
                  <button type="button" className="sub" onClick={clearCatForm}>クリア</button>
                </div>
              </form>
            </section>

            <section className="card">
              <h3>登録済みプロフィール</h3>
              {data.cats.length === 0 ? (
                <p className="muted">まだ登録がありません。</p>
              ) : (
                <ul className="stack">
                  {data.cats.map((cat) => (
                    <li key={cat.id} className="item-block">
                      <div>
                        <strong>{cat.emoji} {cat.name}</strong>
                        <div className="muted">{cat.age}歳 / {cat.gender} {cat.memo ? `・${cat.memo}` : ""}</div>
                      </div>
                      <div className="mini-actions">
                        <button className="sub" onClick={() => startEditCat(cat)}>編集</button>
                        <button className="danger" onClick={() => deleteCat(cat.id)}>削除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === "records" && (
          <>
            <section className="card">
              <h2>{recordForm.id ? "日次記録編集" : "日次記録追加"}</h2>
              <form onSubmit={saveRecord} className="form-grid">
                <label>猫
                  <select value={recordForm.catId} onChange={(e) => setRecordForm((p) => ({ ...p, catId: e.target.value }))}>
                    <option value="">選択してください</option>
                    {data.cats.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </label>
                {recordErrors.catId && <p className="error">{recordErrors.catId}</p>}

                <label>日付<input type="date" value={recordForm.date} onChange={(e) => setRecordForm((p) => ({ ...p, date: e.target.value }))} /></label>
                {recordErrors.date && <p className="error">{recordErrors.date}</p>}

                <label>ごはん量(g)<input type="number" value={recordForm.food} onChange={(e) => setRecordForm((p) => ({ ...p, food: e.target.value }))} /></label>
                {recordErrors.food && <p className="error">{recordErrors.food}</p>}

                <label>飲水量(ml)<input type="number" value={recordForm.water} onChange={(e) => setRecordForm((p) => ({ ...p, water: e.target.value }))} /></label>
                {recordErrors.water && <p className="error">{recordErrors.water}</p>}

                <div className="two-col">
                  <label>うんち回数<input type="number" value={recordForm.poop} onChange={(e) => setRecordForm((p) => ({ ...p, poop: e.target.value }))} /></label>
                  <label>おしっこ回数<input type="number" value={recordForm.pee} onChange={(e) => setRecordForm((p) => ({ ...p, pee: e.target.value }))} /></label>
                </div>
                {recordErrors.poop && <p className="error">うんち: {recordErrors.poop}</p>}
                {recordErrors.pee && <p className="error">おしっこ: {recordErrors.pee}</p>}

                <label>メモ<textarea rows="2" value={recordForm.note} onChange={(e) => setRecordForm((p) => ({ ...p, note: e.target.value }))} /></label>

                <div className="actions">
                  <button type="submit">{recordForm.id ? "更新" : "追加"}</button>
                  <button type="button" className="sub" onClick={clearRecordForm}>クリア</button>
                </div>
              </form>
              {selectedCatName && <p className="muted">現在選択中: {selectedCatName}</p>}
            </section>

            <section className="card">
              <h3>日次記録一覧（日付の新しい順）</h3>
              {recordsByDateDesc.length === 0 ? (
                <p className="muted">記録がありません。</p>
              ) : (
                <ul className="stack">
                  {recordsByDateDesc.map((r) => (
                    <li key={r.id} className="item-block">
                      <div>
                        <strong>{r.date} / {data.cats.find((c) => c.id === r.catId)?.name || "削除済み"}</strong>
                        <div className="muted">🍚{r.food}g ・ 💧{r.water}ml ・ 💩{r.poop} ・ 🚽{r.pee}</div>
                        {r.note && <div className="muted">メモ: {r.note}</div>}
                      </div>
                      <div className="mini-actions">
                        <button className="sub" onClick={() => startEditRecord(r)}>編集</button>
                        <button className="danger" onClick={() => deleteRecord(r.id)}>削除</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === "settings" && (
          <section className="card">
            <h2>データ管理</h2>
            <p className="muted">localStorageで保存されています。必要に応じて削除できます。</p>

            <div className="setting-actions">
              <button className="danger" onClick={resetAll}>データを完全リセット</button>
              <button className="sub" disabled={!data.sampleDataIncluded} onClick={removeSampleData}>サンプルデータ削除</button>
            </div>

            <div className="meta">
              <div>猫プロフィール: <strong>{data.cats.length}</strong>件</div>
              <div>日次記録: <strong>{data.records.length}</strong>件</div>
              <div>サンプルデータ: <strong>{data.sampleDataIncluded ? "あり" : "なし"}</strong></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
