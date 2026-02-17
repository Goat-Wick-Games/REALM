#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::init as shell_init;
use tauri_plugin_dialog::init as dialog_init;
use tauri_plugin_fs::init as fs_init;
use tauri_plugin_sql::Builder as SqlBuilder;
use tauri_plugin_store::Builder as StoreBuilder;

fn main() {
    tauri::Builder::default()
        .plugin(shell_init())
        .plugin(dialog_init())
        .plugin(fs_init())
        .plugin(StoreBuilder::default().build())
        .plugin(SqlBuilder::default().build())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}