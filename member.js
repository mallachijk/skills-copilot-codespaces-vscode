function skillsMember() {
    var member = document.getElementById("member");
    var memberSelect = member.options[member.selectedIndex].value;
    var memberText = member.options[member.selectedIndex].text;
    var memberText = memberText.replace(/ /g, "_");
    if (memberSelect == "all") {
        memberText = "all";
    }
    var member = memberText;
    var member = member.toLowerCase();
    var member = member.replace(/'/g, "");
    var member = member.replace(/&/g, "");()