import { useState } from "react";
import { jsPDF } from "jspdf";
import { Leaf, Sparkles, ArrowDownToLine, LoaderCircle } from "lucide-react";
import "./App.css";
// Types mirror the FastAPI request and the daily/weekly response shapes.
type P = {
  age: number | "";
  gender: string;
  weight: number | "";
  meals: number | "";
  medical_condition: string;
  allergy: string;
  health_goal: string;
  food_type: string;
  ethnicity: string;
  plan_type: "daily" | "weekly";
};
type F = { name: string; quantity: string; calories: number; protein: number };
type M = { title: string; meal_type: string; foods: F[] };
type D = {
  meals: M[];
  daily_calories: number;
  daily_protein: number;
  guidelines: string[];
};
type Plan = {
  profile?: P;
  meals?: M[];
  daily_calories?: number;
  daily_protein?: number;
  guidelines?: string[];
  days?: D[];
  weekly_guidelines?: string[];
};
// The form starts blank. Sample values are available through the testing toggle.
const emptyProfile: P = {
  age: "",
  gender: "",
  weight: "",
  meals: "",
  medical_condition: "",
  allergy: "",
  health_goal: "",
  food_type: "",
  ethnicity: "",
  plan_type: "daily",
};
const sampleProfile: P = {
  age: 25,
  gender: "male",
  weight: 78,
  meals: 4,
  medical_condition: "None",
  allergy: "None",
  health_goal: "Build muscle",
  food_type: "Veg/Non-veg",
  ethnicity: "Indian",
  plan_type: "daily",
};


// Convert API meal labels such as "Evening_snack" into display text.
const title = (s: string) =>
  s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
function App() {
  const [p, S] = useState(emptyProfile),
    [sampleMode, SM] = useState(false),
    [plan, P] = useState<Plan | null>(null),
    [generatedProfile, GP] = useState<P | null>(null),
    [day, D] = useState(0),
    [busy, B] = useState(false),
    [err, E] = useState("");
  // Keep one small helper for updating a single profile field.
  const put = (k: keyof P, v: string | number) => S((x) => ({ ...x, [k]: v }));
  // Submit the profile to the same-origin Vite proxy and validate the returned plan shape.
  async function go() {
    const submittedProfile = {
      ...p,
      age: Number(p.age),
      weight: Number(p.weight),
      meals: Number(p.meals),
    };
    B(true);
    E("");
    P(null);
    try {
      const r = await fetch("/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submittedProfile),
      });
      if (!r.ok) throw Error((await r.text()) || "Request failed");
      const payload = await r.json();
      // Accept the API response directly, or inside a common data/result envelope.
      const result = payload?.data ?? payload?.result ?? payload;
      if (!Array.isArray(result?.meals) && !Array.isArray(result?.days)) {
        throw Error("The API response did not include meals or days.");
      }
      if (
        submittedProfile.plan_type === "weekly" &&
        result.days?.length !== 7
      ) {
        throw Error(
          "The API returned an incomplete weekly plan. Please try generating it again.",
        );
      }
      P(result);
      GP(submittedProfile);
      D(0);
    } catch (e) {
      E(
        e instanceof Error && e.message.includes("fetch")
          ? "Could not reach API. Start the backend and check BACKEND_URL in frontend/.env."
          : e instanceof Error
            ? e.message
            : "Please try again.",
      );
    } finally {
      B(false);
    }
  }
  // Normalize both response formats into a list of days so the view and PDF share one path.
  // Daily API responses have meals at the root; weekly responses provide a days array.
  const days =
      (plan?.days?.length ? plan.days : null) ??
      (plan?.meals
        ? [
            {
              meals: plan.meals,
              daily_calories: plan.daily_calories ?? 0,
              daily_protein: plan.daily_protein ?? 0,
              guidelines: plan.guidelines ?? [],
            },
          ]
        : []),
    cur = days[day];
  // Build one A4 page per day. A daily plan has one day; a weekly plan has seven.
  function pdf() {
    if (!days.length) return;
    const out = new jsPDF({ unit: "mm", format: "a4" });
    // jsPDF coordinates use millimetres; these margins leave 15 mm on each side.
    const left = 15;
    const right = 195;
    const width = right - left;

    // Start a new page for each day after the first.
    days.forEach((x, i) => {
      if (i) out.addPage();

      out.setFillColor(23, 91, 68);
      out.rect(0, 0, 210, 39, "F");
      out.setTextColor(224, 239, 225);
      out.setFont("helvetica", "bold");
      out.setFontSize(9);
      out.text("NOURISH  /  PERSONAL MEAL PLAN", left, 12);
      out.setTextColor(255, 255, 255);
      out.setFontSize(20);
      out.text(
        generatedProfile?.plan_type === "weekly"
          ? "Day " + (i + 1) + " meal plan"
          : "Your daily meal plan",
        left,
        25,
      );
      out.setTextColor(225, 238, 226);
      out.setFont("helvetica", "normal");
      out.setFontSize(9);
      out.text(p.age + " years  |  " + p.weight + " kg  |  " + p.ethnicity + " cuisine", left, 33);

      out.setFillColor(243, 247, 241);
      out.roundedRect(left, 45, width, 18, 2, 2, "F");
      out.setTextColor(43, 67, 51);
      out.setFont("helvetica", "bold");
      out.setFontSize(11);
      out.text(x.daily_calories.toLocaleString() + " kcal", left + 5, 53);
      out.setFont("helvetica", "normal");
      out.setFontSize(8);
      out.setTextColor(105, 122, 108);
      out.text("DAILY ENERGY", left + 5, 59);
      out.setTextColor(43, 67, 51);
      out.setFont("helvetica", "bold");
      out.setFontSize(11);
      out.text(x.daily_protein + " g", left + 82, 53);
      out.setFont("helvetica", "normal");
      out.setFontSize(8);
      out.setTextColor(105, 122, 108);
      out.text("PROTEIN", left + 82, 59);
      out.setTextColor(43, 67, 51);
      out.setFont("helvetica", "bold");
      out.setFontSize(11);
      out.text(x.meals.length + " meals", left + 137, 53);
      out.setFont("helvetica", "normal");
      out.setFontSize(8);
      out.setTextColor(105, 122, 108);
      out.text("IN YOUR PLAN", left + 137, 59);

      // y is the vertical cursor: each meal card advances it down the page.
      let y = 70;
      x.meals.forEach((meal, mealIndex) => {
        // Measure wrapped food descriptions first so the card can fit every row.
        const rows = meal.foods.map((food) => {
          out.setFont("helvetica", "normal");
          out.setFontSize(9);
          const description = out.splitTextToSize(food.name + "  -  " + food.quantity, 126);
          return { food, description, height: Math.max(7, description.length * 4.1 + 1) };
        });
        // Card height = heading space + all food rows + bottom padding.
        const cardHeight = 15 + rows.reduce((sum, row) => sum + row.height, 0) + 3;
        out.setFillColor(255, 255, 255);
        out.setDrawColor(226, 234, 225);
        out.roundedRect(left, y, width, cardHeight, 2, 2, "FD");
        out.setFillColor(231, 240, 230);
        out.roundedRect(left + 4, y + 4, 7, 7, 1.5, 1.5, "F");
        out.setTextColor(42, 96, 67);
        out.setFont("helvetica", "bold");
        out.setFontSize(8);
        out.text(String(mealIndex + 1).padStart(2, "0"), left + 5.1, y + 8.8);
        out.setTextColor(103, 124, 106);
        out.setFontSize(7.5);
        out.text(title(meal.meal_type).toUpperCase(), left + 14, y + 6.5);
        out.setTextColor(39, 58, 45);
        out.setFontSize(11);
        out.text(meal.title, left + 14, y + 12);

        let rowY = y + 18;
        rows.forEach(({ food, description, height }) => {
          out.setDrawColor(239, 242, 237);
          out.line(left + 4, rowY - 2, right - 4, rowY - 2);
          out.setFont("helvetica", "normal");
          out.setFontSize(9);
          out.setTextColor(49, 64, 52);
          out.text(description, left + 5, rowY + 2);
          out.setFont("helvetica", "bold");
          out.setFontSize(8.5);
          out.setTextColor(65, 91, 67);
          out.text(
            food.calories + " kcal  |  " + food.protein + " g protein",
            right - 5,
            rowY + 2,
            { align: "right" },
          );
          rowY += height;
        });
        y += cardHeight + 4;
      });

      // Add the day's guidelines after the meals when there is room on this page.
      const tips = x.guidelines || [];
      if (tips.length && y < 261) {
        y += 1;
        out.setTextColor(49, 86, 57);
        out.setFont("helvetica", "bold");
        out.setFontSize(9.5);
        out.text("A FEW GOOD THINGS TO KEEP IN MIND", left, y + 3);
        y += 8;
        tips.forEach((tip) => {
          const lines = out.splitTextToSize("-  " + tip, width - 8);
          out.setFont("helvetica", "normal");
          out.setFontSize(8.5);
          out.setTextColor(75, 91, 77);
          out.text(lines, left + 2, y);
          y += lines.length * 4 + 1.5;
        });
      }
      out.setDrawColor(227, 234, 226);
      out.line(left, 284, right, 284);
      out.setFont("helvetica", "normal");
      out.setFontSize(8);
      out.setTextColor(120, 132, 121);
      out.text("Prepared around your goals  |  General wellness guidance", left, 290);
      out.text(String(i + 1).padStart(2, "0"), right, 290, { align: "right" });
    });
    out.save(
      "nourish-" + (generatedProfile?.plan_type ?? "daily") + "-plan.pdf",
    );
  }
  // Reusable controlled input; opts switches it to a dropdown.
  const field = (
    k: keyof P,
    label: string,
    opts?: string[],
    placeholder?: string,
  ) => (
    <label>
      <span>{label}</span>
      {opts ? (
        <select required value={p[k]} onChange={(e) => put(k, e.target.value)}>
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {opts.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          required
          type={k === "age" || k === "weight" ? "number" : "text"}
          min={k === "age" || k === "weight" ? 1 : undefined}
          value={p[k]}
          placeholder={placeholder}
          onChange={(e) =>
            put(
              k,
              k === "age" || k === "weight" || k === "meals"
                ? e.target.value === ""
                  ? ""
                  : Number(e.target.value)
                : e.target.value,
            )
          }
        />
      )}
    </label>
  );
  return (
    <div className="shell">
      <header>
        <b>
          <i>
            <Leaf size={18} />
          </i>{" "}
          nourish.
        </b>
        <img src="alembic_logo.png" className="w-32 " />
        <small>YOUR PERSONAL NUTRITION</small>
      </header>
      <main>
        <section className="hidden">
          <div>
            <small>✳ &nbsp; YOUR NEXT CHAPTER STARTS HERE</small>
            <h1>
              Eat well.
              <br />
              <em>Feel unstoppable.</em>
            </h1>
            <p>
              A meal plan that meets you where you are and takes you where you
              want to go.
            </p>
            <aside>✓ Made around you &nbsp;&nbsp; ✓ Everyday ingredients</aside>
          </div>
          <div className="bowl">
            🥗
            <small>
              GOOD FOOD
              <br />
              GOOD MOOD
            </small>
          </div>
        </section>
        {/* Profile form on the left; generated plan and weekly day tabs on the right. */}
        <div className="cols">
          <section className="card">
            <small className="kicker">01 &nbsp; THE STARTING POINT</small>
            <h2>Let’s get to know you.</h2>
            <p className="muted">
              A few details help us make a plan that feels like yours.
            </p>
            <label className="sample-toggle">
              <input
                type="checkbox"
                checked={sampleMode}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  SM(enabled);
                  S(enabled ? { ...sampleProfile } : { ...emptyProfile });
                }}
              />
              <span>Use sample values (testing)</span>
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void go();
              }}
            >
              <div className="fields">
                {field("age", "AGE", undefined, "Enter your age in years")}
                {field(
                  "weight",
                  "WEIGHT",
                  undefined,
                  "Enter your weight in kg",
                )}
                {field("gender", "GENDER", ["male", "female", "other"])}
                {field("meals", "MEALS PER DAY", ["2", "3", "4", "5", "6"])}
                {field("food_type", "FOOD PREFERENCE", [
                  "Veg/Non-veg",
                  "Vegetarian",
                  "Vegan",
                  "Non-vegetarian",
                  "Eggetarian",
                ])}
                {field("ethnicity", "CUISINE", [
                  "Indian",
                  "Mediterranean",
                  "Asian",
                  "American",
                  "Middle Eastern",
                  "Other",
                ])}
                {field(
                  "allergy",
                  "ALLERGIES / FOODS TO AVOID",
                  undefined,
                  "Enter none if not applicable",
                )}
                {field(
                  "medical_condition",
                  "MEDICAL CONDITIONS",
                  undefined,
                  "Enter none if not applicable",
                )}
                {field("health_goal", "HEALTH GOAL", [
                  "Lose weight",
                  "Gain weight",
                  "Maintain weight",
                  "Build muscle",
                  "Improve fitness and energy",
                  "Improve overall health",
                ])}
              </div>
              <small className="kicker planlabel">YOUR PLAN</small>
              <div className="choices">
                {(["daily", "weekly"] as const).map((v) => (
                  <button
                    type="button"
                    className={p.plan_type === v ? "choice active" : "choice"}
                    onClick={() => put("plan_type", v)}
                  >
                    <b>{v === "daily" ? "One day" : "One week"}</b>
                    <small>
                      {v === "daily"
                        ? "A little inspiration for today"
                        : "Your full seven-day rhythm"}
                    </small>
                  </button>
                ))}
              </div>
              <button className="generate" disabled={busy}>
                {busy ? (
                  <>
                    <LoaderCircle className="spin" /> Building your plan…
                  </>
                ) : (
                  <>
                    <Sparkles size={17} /> Generate my{" "}
                    {p.plan_type === "daily" ? "day" : "week"} →
                  </>
                )}
              </button>
              <p className="disclaimer">
                General wellness guidance, not a substitute for medical advice.
              </p>
            </form>
          </section>
          <section className="card results">
            <small className="kicker">02 &nbsp; MADE FOR YOUR TABLE</small>
            {!plan && !busy && (
              <div className="blank">
                <div className="leaf">✳</div>
                <h2>
                  Your plan will feel
                  <br />
                  <em>like it was made for you.</em>
                </h2>
                <p>
                  Tell us a little about yourself and we’ll bring your next meal
                  into focus.
                </p>
              </div>
            )}
            {busy && (
              <div className="blank">
                <LoaderCircle className="spin" />
                <h2>Gathering good things…</h2>
              </div>
            )}
            {err && <p className="error">{err}</p>}
            {plan && cur && (
              <>
                <div className="resulthead">
                  <div>
                    <small className="kicker">
                      YOUR {generatedProfile?.plan_type.toUpperCase()} EDITION
                    </small>
                    <h2>
                      {generatedProfile?.plan_type === "daily"
                        ? "A day, well fed."
                        : "A week of feeling good."}
                    </h2>
                  </div>
                  <button className="download" onClick={pdf}>
                    <ArrowDownToLine size={15} /> PDF
                  </button>
                </div>
                {generatedProfile?.plan_type === "weekly" && (
                  <nav className="days">
                    {days.map((_, i) => (
                      <button
                        className={day === i ? "on" : ""}
                        onClick={() => D(i)}
                      >
                        DAY
                        <br />
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                )}
                <div className="stats">
                  <b>
                    🔥 {cur.daily_calories}
                    <small> kcal</small>
                  </b>
                  <b>
                    ✳ {cur.daily_protein}
                    <small> g protein</small>
                  </b>
                  <b>
                    ☰ {cur.meals.length}
                    <small> meals</small>
                  </b>
                </div>
                <div className="meals">
                  {cur.meals.map((m) => (
                    <article>
                      <div className="mealhead">
                        <span>✳</span>
                        <div>
                          <small>{title(m.meal_type)}</small>
                          <b>{m.title}</b>
                        </div>
                      </div>
                      {m.foods.map((f) => (
                        <div className="food">
                          <div>
                            <b>{f.name}</b>
                            <small>{f.quantity}</small>
                          </div>
                          <small>
                            {f.calories} kcal · {f.protein}g
                          </small>
                        </div>
                      ))}
                    </article>
                  ))}
                </div>
                <div className="tips">
                  <b>A few good things to keep in mind</b>
                  {(generatedProfile?.plan_type === "weekly" &&
                  plan.weekly_guidelines?.length
                    ? plan.weekly_guidelines
                    : cur.guidelines
                  )
                    .slice(0, 3)
                    .map((t) => (
                      <p>✓ &nbsp;{t}</p>
                    ))}
                </div>
              </>
            )}
          </section>
        </div>
        <footer>
          Alcare | Digilabs <i>Small steps, good things.</i>
        </footer>
      </main>
    </div>
  );
}
export default App;
