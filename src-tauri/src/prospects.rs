use chrono::{DateTime, NaiveDate, NaiveDateTime, TimeZone};
use chrono_tz::Europe::Paris;
use parking_lot::RwLock;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::State;

fn lax_string<'de, D: serde::Deserializer<'de>>(deserializer: D) -> Result<String, D::Error> {
    let value: Option<serde_json::Value> = Option::deserialize(deserializer)?;
    Ok(match value {
        Some(serde_json::Value::String(s)) => s,
        Some(serde_json::Value::Number(n)) => n.to_string(),
        _ => String::new(),
    })
}

fn lax_bool<'de, D: serde::Deserializer<'de>>(deserializer: D) -> Result<bool, D::Error> {
    let value: Option<serde_json::Value> = Option::deserialize(deserializer)?;
    Ok(match value {
        Some(serde_json::Value::Bool(b)) => b,
        Some(serde_json::Value::Number(n)) => n.as_i64().unwrap_or(0) != 0,
        Some(serde_json::Value::String(s)) => matches!(s.to_lowercase().as_str(), "true" | "1" | "yes"),
        _ => false,
    })
}

fn lax_i64<'de, D: serde::Deserializer<'de>>(deserializer: D) -> Result<i64, D::Error> {
    let value: Option<serde_json::Value> = Option::deserialize(deserializer)?;
    Ok(match value {
        Some(serde_json::Value::Number(n)) => n.as_i64().unwrap_or_else(|| n.as_f64().unwrap_or(0.0) as i64),
        Some(serde_json::Value::String(s)) => s.parse::<i64>().unwrap_or(0),
        Some(serde_json::Value::Bool(b)) => if b { 1 } else { 0 },
        _ => 0,
    })
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkedinProspect {
    #[serde(default, deserialize_with = "lax_i64")]
    pub id: i64,
    #[serde(default, deserialize_with = "lax_string")]
    pub first_name: String,
    #[serde(default, deserialize_with = "lax_string")]
    pub last_name: String,
    #[serde(default)]
    pub position: Option<String>,
    #[serde(default)]
    pub company: Option<String>,
    #[serde(default)]
    pub industry: Option<String>,
    #[serde(default)]
    pub city: Option<String>,
    #[serde(default)]
    pub region: Option<String>,
    #[serde(default)]
    pub linkedin_url: Option<String>,
    #[serde(default)]
    pub company_linkedin_url: Option<String>,
    #[serde(default)]
    pub website_url: Option<String>,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub phone: Option<String>,
    #[serde(default, deserialize_with = "lax_string")]
    pub status: String,
    #[serde(default, deserialize_with = "lax_bool")]
    pub is_favorite: bool,
    #[serde(default)]
    pub invitation_sent_at: Option<String>,
    #[serde(default)]
    pub invitation_accepted_at: Option<String>,
    #[serde(default)]
    pub message1_sent_at: Option<String>,
    #[serde(default)]
    pub replied_at: Option<String>,
    #[serde(default, deserialize_with = "lax_bool")]
    pub positive_reply: bool,
    #[serde(default, deserialize_with = "lax_i64")]
    pub relances_count: i64,
    #[serde(default)]
    pub next_action: Option<String>,
    #[serde(default)]
    pub next_action_at: Option<String>,
    #[serde(default)]
    pub discovery_call_at: Option<String>,
    #[serde(default)]
    pub sales_call_at: Option<String>,
    #[serde(default)]
    pub proposal_amount: Option<f64>,
    #[serde(default)]
    pub signed_amount: Option<f64>,
    #[serde(default)]
    pub added_at_week: Option<String>,
    #[serde(default, deserialize_with = "lax_string")]
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkedinFilters {
    pub search: Option<String>,
    pub statuses: Option<Vec<String>>,
    pub is_favorite: Option<bool>,
    pub week: Option<String>,
    pub sort_by: Option<String>,
    pub sort_dir: Option<String>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryMeta {
    pub total: i64,
    pub per_page: i64,
    pub current_page: i64,
    pub last_page: i64,
    pub first_page: i64,
    pub first_page_url: Option<String>,
    pub last_page_url: Option<String>,
    pub next_page_url: Option<String>,
    pub previous_page_url: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkedinQueryResult {
    pub data: Vec<LinkedinProspect>,
    pub meta: QueryMeta,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LinkedinCallEvent {
    pub prospect: LinkedinProspect,
    pub call_type: String,
    pub date_iso: String,
    pub has_time: bool,
    pub time_label: String,
}

pub struct LinkedinStore(pub RwLock<Vec<LinkedinProspect>>);

fn lowercase_contains(haystack: &str, needle: &str) -> bool {
    haystack.to_lowercase().contains(needle)
}

fn parse_iso_to_paris_date(iso: &str) -> Option<NaiveDate> {
    if iso.len() >= 10 {
        if let Ok(d) = NaiveDate::parse_from_str(&iso[..10], "%Y-%m-%d") {
            return Some(d);
        }
    }
    if let Ok(dt) = DateTime::parse_from_rfc3339(iso) {
        return Some(dt.with_timezone(&Paris).date_naive());
    }
    if let Ok(ndt) = NaiveDateTime::parse_from_str(iso, "%Y-%m-%dT%H:%M:%S%.fZ") {
        return Paris.from_local_datetime(&ndt).single().map(|dt| dt.date_naive());
    }
    None
}

fn format_time_paris(iso: &str) -> String {
    if let Ok(dt) = DateTime::parse_from_rfc3339(iso) {
        return dt.with_timezone(&Paris).format("%H:%M").to_string();
    }
    if iso.len() >= 16 {
        return iso[11..16].to_string();
    }
    String::new()
}

fn parse_iso_ms(iso: &str) -> Option<i64> {
    if let Ok(dt) = DateTime::parse_from_rfc3339(iso) {
        return Some(dt.timestamp_millis());
    }
    if iso.len() >= 10 {
        if let Ok(d) = NaiveDate::parse_from_str(&iso[..10], "%Y-%m-%d") {
            return Paris
                .from_local_datetime(&d.and_hms_opt(0, 0, 0)?)
                .single()
                .map(|dt| dt.timestamp_millis());
        }
    }
    None
}

fn slice_with_meta(
    items: Vec<LinkedinProspect>,
    page: i64,
    per_page: i64,
) -> (Vec<LinkedinProspect>, QueryMeta) {
    let page: i64 = page.max(1);
    let per_page: i64 = per_page.max(1);
    let total: i64 = items.len() as i64;
    let last_page: i64 = if total == 0 { 1 } else { (total + per_page - 1) / per_page };
    let start: usize = ((page - 1) * per_page) as usize;
    let end: usize = (start + per_page as usize).min(items.len());
    let data: Vec<LinkedinProspect> = if start >= items.len() {
        Vec::new()
    } else {
        items[start..end].to_vec()
    };

    let meta = QueryMeta {
        total,
        per_page,
        current_page: page,
        last_page,
        first_page: 1,
        first_page_url: None,
        last_page_url: None,
        next_page_url: if page < last_page {
            Some(format!("?page={}", page + 1))
        } else {
            None
        },
        previous_page_url: if page > 1 {
            Some(format!("?page={}", page - 1))
        } else {
            None
        },
    };

    (data, meta)
}

#[tauri::command]
pub fn linkedin_set_all(prospects: Vec<LinkedinProspect>, store: State<'_, LinkedinStore>) {
    let mut guard = store.0.write();
    *guard = prospects;
}

#[tauri::command]
pub fn linkedin_upsert(prospect: LinkedinProspect, store: State<'_, LinkedinStore>) {
    let mut guard = store.0.write();
    if let Some(pos) = guard.iter().position(|p| p.id == prospect.id) {
        guard[pos] = prospect;
    } else {
        guard.insert(0, prospect);
    }
}

#[tauri::command]
pub fn linkedin_upsert_many(prospects: Vec<LinkedinProspect>, store: State<'_, LinkedinStore>) {
    let mut guard = store.0.write();
    for prospect in prospects {
        if let Some(pos) = guard.iter().position(|p| p.id == prospect.id) {
            guard[pos] = prospect;
        } else {
            guard.push(prospect);
        }
    }
}

#[tauri::command]
pub fn linkedin_remove(id: i64, store: State<'_, LinkedinStore>) {
    let mut guard = store.0.write();
    guard.retain(|p| p.id != id);
}

#[tauri::command]
pub fn linkedin_clear(store: State<'_, LinkedinStore>) {
    let mut guard = store.0.write();
    guard.clear();
}

#[tauri::command]
pub fn linkedin_count(store: State<'_, LinkedinStore>) -> i64 {
    let guard = store.0.read();
    guard.len() as i64
}

#[tauri::command]
pub fn linkedin_query(filters: LinkedinFilters, store: State<'_, LinkedinStore>) -> LinkedinQueryResult {
    let guard = store.0.read();
    let search_lc: Option<String> = filters.search.as_ref().map(|s| s.to_lowercase());
    let statuses: Option<&Vec<String>> = filters.statuses.as_ref();
    let week: Option<&String> = filters.week.as_ref();
    let only_favorite: bool = matches!(filters.is_favorite, Some(true));

    let mut filtered: Vec<LinkedinProspect> = guard
        .par_iter()
        .filter(|p| {
            if let Some(ref s) = search_lc {
                let hits: bool = lowercase_contains(&p.first_name, s)
                    || lowercase_contains(&p.last_name, s)
                    || p.position.as_deref().map(|v| lowercase_contains(v, s)).unwrap_or(false)
                    || p.company.as_deref().map(|v| lowercase_contains(v, s)).unwrap_or(false)
                    || p.industry.as_deref().map(|v| lowercase_contains(v, s)).unwrap_or(false)
                    || p.city.as_deref().map(|v| lowercase_contains(v, s)).unwrap_or(false)
                    || p.email.as_deref().map(|v| lowercase_contains(v, s)).unwrap_or(false)
                    || p.phone.as_deref().map(|v| lowercase_contains(v, s)).unwrap_or(false);
                if !hits {
                    return false;
                }
            }
            if let Some(st) = statuses {
                if !st.iter().any(|s| s == &p.status) {
                    return false;
                }
            }
            if only_favorite && !p.is_favorite {
                return false;
            }
            if let Some(w) = week {
                if p.added_at_week.as_deref() != Some(w.as_str()) {
                    return false;
                }
            }
            true
        })
        .cloned()
        .collect();

    let sort_by: &str = filters.sort_by.as_deref().unwrap_or("createdAt");
    let desc: bool = filters.sort_dir.as_deref().unwrap_or("desc") == "desc";

    filtered.par_sort_by(|a, b| {
        let ord = match sort_by {
            "lastName" => a.last_name.cmp(&b.last_name),
            "nextActionAt" => a.next_action_at.cmp(&b.next_action_at),
            "invitationSentAt" => a.invitation_sent_at.cmp(&b.invitation_sent_at),
            _ => a.created_at.cmp(&b.created_at),
        };
        if desc { ord.reverse() } else { ord }
    });

    let (data, meta) = slice_with_meta(
        filtered,
        filters.page.unwrap_or(1),
        filters.per_page.unwrap_or(50),
    );
    LinkedinQueryResult { data, meta }
}

#[tauri::command]
pub fn linkedin_calls_by_day(date_iso: String, store: State<'_, LinkedinStore>) -> Vec<LinkedinCallEvent> {
    let target: NaiveDate = match NaiveDate::parse_from_str(&date_iso, "%Y-%m-%d") {
        Ok(d) => d,
        Err(_) => return Vec::new(),
    };
    let guard = store.0.read();
    let mut events: Vec<LinkedinCallEvent> = guard
        .par_iter()
        .flat_map_iter(|p| {
            let mut out: Vec<LinkedinCallEvent> = Vec::new();
            if let Some(iso) = p.discovery_call_at.as_deref() {
                if parse_iso_to_paris_date(iso) == Some(target) {
                    let has_time: bool = iso.len() > 10;
                    out.push(LinkedinCallEvent {
                        prospect: p.clone(),
                        call_type: "discovery".into(),
                        date_iso: iso.to_string(),
                        has_time,
                        time_label: if has_time { format_time_paris(iso) } else { String::new() },
                    });
                }
            }
            if let Some(iso) = p.sales_call_at.as_deref() {
                if parse_iso_to_paris_date(iso) == Some(target) {
                    let has_time: bool = iso.len() > 10;
                    out.push(LinkedinCallEvent {
                        prospect: p.clone(),
                        call_type: "sales".into(),
                        date_iso: iso.to_string(),
                        has_time,
                        time_label: if has_time { format_time_paris(iso) } else { String::new() },
                    });
                }
            }
            out
        })
        .collect();

    events.sort_by(|a, b| {
        let am: i64 = parse_iso_ms(&a.date_iso).unwrap_or(i64::MAX);
        let bm: i64 = parse_iso_ms(&b.date_iso).unwrap_or(i64::MAX);
        am.cmp(&bm)
    });
    events
}

#[tauri::command]
pub fn linkedin_tasks_due(
    horizon_days: i64,
    now_iso: String,
    store: State<'_, LinkedinStore>,
) -> Vec<LinkedinProspect> {
    let now_ms: i64 = match parse_iso_ms(&now_iso) {
        Some(v) => v,
        None => return Vec::new(),
    };
    let horizon_ms: i64 = now_ms + horizon_days * 86_400_000;
    let guard = store.0.read();
    let mut out: Vec<LinkedinProspect> = guard
        .par_iter()
        .filter(|p| {
            if let Some(iso) = p.next_action_at.as_deref() {
                if let Some(ms) = parse_iso_ms(iso) {
                    return ms <= horizon_ms;
                }
            }
            false
        })
        .cloned()
        .collect();

    out.par_sort_by(|a, b| {
        let am: i64 = a.next_action_at.as_deref().and_then(parse_iso_ms).unwrap_or(i64::MAX);
        let bm: i64 = b.next_action_at.as_deref().and_then(parse_iso_ms).unwrap_or(i64::MAX);
        am.cmp(&bm)
    });
    out
}
