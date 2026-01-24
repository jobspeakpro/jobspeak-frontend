const https = require('https');

async function testGuerrilla() {
    try {
        console.log("Getting email address...");
        const res = await fetch('http://api.guerrillamail.com/ajax.php?f=get_email_address');
        const data = await res.json();
        const email = data.email_addr;
        const sid = data.sid_token;
        console.log(`Email: ${email}`);

        console.log("Checking inbox...");
        const listRes = await fetch(`http://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${sid}`);
        const listData = await listRes.json();
        console.log(`Inbox count: ${listData.count}`);
        console.log(`List:`, listData.list);

    } catch (e) {
        console.error("Guerrilla Test Failed:", e);
    }
}

testGuerrilla();
