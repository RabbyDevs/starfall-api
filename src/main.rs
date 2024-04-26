use std::io::Read;
use once_cell::sync::Lazy;
use flate2::read::GzDecoder;
use rocket::data::ToByteUnit;
use rocket::{get, launch, post, routes};
use rocket::Data;

static REQWEST_CLIENT: Lazy<reqwest::Client> = Lazy::new(reqwest::Client::new);
use lune::roblox::{document::Document, instance::Instance};
use rbx_types::Variant;

fn get_content(instance: Instance, content_name: &str) -> String {
    match instance.get_property(content_name).unwrap() {
        Variant::Content(content) => {return content.into_string();},
        _ => panic!("what?!"),
    }
}

async fn traverse_instance<'a>(children: Vec<Instance>) -> String {
    let main_instance = &children[0];
    if main_instance.get_property("ShirtTemplate").is_some() {return get_content(main_instance.clone(), "ShirtTemplate")}
    if main_instance.get_property("PantsTemplate").is_some() {return get_content(main_instance.clone(), "PantsTemplate")}
    if main_instance.get_property("Graphic").is_some() {return get_content(main_instance.clone(), "Graphic")}
    let instances = main_instance.get_descendants();
    for instance in instances {
        if instance.get_property("TextureId").is_some() {
            return get_content(instance, "TextureId")
        }
    }
    "".to_string()
}

async fn do_conversion(buffer: Vec<u8>) -> String {
    let doc = Document::from_bytes_auto(buffer).unwrap();
    let data_model = doc.into_instance_array().unwrap();
    traverse_instance(data_model).await
}

#[get("/image/<asset_id>")]
async fn images(asset_id: u64) -> String {
    let url = format!("https://assetdelivery.roblox.com/v1/asset?id={}", asset_id);
    let response = REQWEST_CLIENT.get(url)
        .send()
        .await.unwrap()
        .bytes().await.unwrap();
    let mut decoder: GzDecoder<&_> = GzDecoder::new(&*response);

    // Read the decompressed data into a buffer
    let mut buffer = Vec::new();
    let decode = decoder.read_to_end(&mut buffer);
    if decode.is_err() {
        do_conversion((&response).to_vec()).await
    } else {
        do_conversion(buffer).await
    }
}


#[post("/webhook/<webhook_id>/<webhook_auth>", data = "<data>")]
async fn webhook(webhook_id: u64, webhook_auth: &str, data: Data<'_>) -> String {
    let body = data.open(128.kilobytes()).into_string().await.unwrap().to_string();
    match REQWEST_CLIENT.post(format!("https://discord.com/api/webhooks/{}/{}", webhook_id, webhook_auth))
        .body(body)
        .header("Content-Type", "application/json")
        .send()
        .await {
            Ok(_) => return String::from("OK"),
            Err(_) => return String::from("FAIL"),
        }
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![images, webhook])
}