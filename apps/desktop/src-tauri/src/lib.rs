use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::sync::Mutex;
use tauri::State;

struct Presence(Mutex<Option<DiscordIpcClient>>);

#[tauri::command]
fn set_presence(state: State<Presence>, details: String, state_text: String) -> Result<(), String> {
    let mut guard = state.0.lock().map_err(|e| e.to_string())?;

    if guard.is_none() {
        let mut client =
            DiscordIpcClient::new("1568993295340675153").map_err(|e| e.to_string())?;
        client.connect().map_err(|e| e.to_string())?;
        *guard = Some(client);
    }

if let Some(client) = guard.as_mut() {
    let payload = activity::Activity::new()
        .details(&details)
        .state(&state_text)
        .assets(
            activity::Assets::new()
                .large_image("realm_logo")
                .large_text("REALM"),
        );
    if client.set_activity(payload).is_err() {
        *guard = None;
        return Err("discord connection lost".into());
    }
}


    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .manage(Presence(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![set_presence])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

