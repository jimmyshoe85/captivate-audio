(function() {
try {
if (typeof window.cpAPIInterface === 'undefined') {
alert('Captivate API not available');
return;
}
window.cpAPIInterface.setVariableValue("evaluationLoading", "true");
window.cpAPIInterface.setVariableValue("claraEvaluation", "Miss Clara is reviewing your performance");
window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
var currentRoom = window.cpAPIInterface.getVariableValue("currentRoom") || "water";
var totalScore = parseInt(window.cpAPIInterface.getVariableValue("totalScore")) || 0;
var redWinePossible = parseInt(window.cpAPIInterface.getVariableValue("redWinePossible")) || 0;
var redWineActual = parseInt(window.cpAPIInterface.getVariableValue("redWineActual")) || 0;
var whiteWinePossible = parseInt(window.cpAPIInterface.getVariableValue("whiteWinePossible")) || 0;
var whiteWineActual = parseInt(window.cpAPIInterface.getVariableValue("whiteWineActual")) || 0;
var scenariosCompleted = parseInt(window.cpAPIInterface.getVariableValue("scenariosCompleted")) || 0;

var totalPossible = redWinePossible + whiteWinePossible;
var overallPercentage = totalPossible ? Math.round((totalScore / totalPossible) * 100) : 0;
var redPerc = redWinePossible ? Math.round((redWineActual / redWinePossible) * 100) : 0;
var whitePerc = whiteWinePossible ? Math.round((whiteWineActual / whiteWinePossible) * 100) : 0;
var hasRed = redWinePossible > 0;
var hasWhite = whiteWinePossible > 0;
var balanced = hasRed && hasWhite;
var sessionHistory = "ROOM: " + currentRoom.toUpperCase() + "\nSCENARIOS COMPLETED: " + scenariosCompleted + "\n\nOVERLL PERFORMANCE:\nScore: " + totalScore + "/" + totalPossible + "\nPercentage: " + overallPercentage + "%\n\nRED WINE PERFORMANCE:\nScore: " + redWineActual + "/" + redWinePossible + "\nPercentage: " + redPerc + "%" + (!hasRed ? " - WARNING: No red wine scenarios" : "") + "\n\nWHITE WINE PERFORMANCE:\nScore: " + whiteWineActual + "/" + whiteWinePossible + "\nPercentage: " + whitePerc + "%" + (!hasWhite ? " - WARNING: No white wine scenarios" : "") + "\n\nBALANCE CHECK:\n" + (balanced ? "Complete - both red and white scenarios completed." : "INCOMPLETE - missing either red or white scenarios. Needs more practice.");
fetch("https://captivate-audio.vercel.app/api/miss_clara_evaluation", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ sessionHistory: sessionHistory, currentRoom: currentRoom })
})
.then(function(response) {
if (!response.ok) throw new Error("Evaluation API error: " + response.status);
return response.json();
})
.then(function(data) {
if (!data.success || !data.evaluation) throw new Error("Invalid evaluation data");
var evaluation = data.evaluation;
window.cpAPIInterface.setVariableValue("claraOverallAssessment", evaluation.overallAssessment || "");
window.cpAPIInterface.setVariableValue("claraStrengths", evaluation.strengths || "");
window.cpAPIInterface.setVariableValue("claraWeaknesses", evaluation.weaknesses || "");
window.cpAPIInterface.setVariableValue("claraPatternAnalysis", evaluation.patternAnalysis || "");
window.cpAPIInterface.setVariableValue("claraFinalVerdict", evaluation.finalVerdict || "");
window.cpAPIInterface.setVariableValue("claraNextSteps", evaluation.nextSteps || "");
window.cpAPIInterface.setVariableValue("claraTTSText", evaluation.ttsText || "");
window.cpAPIInterface.setVariableValue("isRemedial", String(evaluation.isRemedial));
var fullText = evaluation.overallAssessment || "";
if (evaluation.strengths) fullText += "\n\nSTRENGTHS: " + evaluation.strengths;
if (evaluation.weaknesses) fullText += "\n\nAREAS FOR IMPROVEMENT: " + evaluation.weaknesses;
if (evaluation.patternAnalysis) fullText += "\n\nPATTERN ANALYSIS: " + evaluation.patternAnalysis;
if (evaluation.finalVerdict) fullText += "\n\n" + evaluation.finalVerdict;
if (evaluation.nextSteps) fullText += "\n\nNEXT STEPS: " + evaluation.nextSteps;
window.cpAPIInterface.setVariableValue("claraEvaluation", fullText);
window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
var audioText = evaluation.overallAssessment || evaluation.overallAssessment;
if (!audioText) throw new Error("No audio text to speak");
window.cpAPIInterface.setVariableValue("debugAudioText", audioText);
return fetch("https://captivate-audio.vercel.app/api/tts", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text: audioText, char: "clara" })
});
})
.then(function(response) {
if (!response.ok) throw new Error("TTS API error: " + response.status);
return response.blob();
})
.then(function(audioBlob) {
if (!audioBlob || !audioBlob.size) throw new Error("Empty audio blob");
var audioUrl = URL.createObjectURL(audioBlob);
var audio = new Audio(audioUrl);
window.MISS_CLARA_AUDIO = { url: audioUrl, audio: audio, blob: audioBlob };
window.cpAPIInterface.setVariableValue("claraAudioBlobUrl", audioUrl);
audio.load();
window.cpAPIInterface.setVariableValue("claraAudioReady", "true");
window.cpAPIInterface.setVariableValue("audioBlobSize", String(audioBlob.size));
})
.catch(function(error) {
var errorMsg = error.message || "Unknown error";
window.cpAPIInterface.setVariableValue("debugError", errorMsg);
var passingScore = totalPossible * 0.6;
var isRemedial = totalScore < passingScore || !balanced;
var fallbackText = "Technical difficulties. Based on " + overallPercentage + "% you have " + (isRemedial ? "not met" : "met") + " the standards.";
window.cpAPIInterface.setVariableValue("claraEvaluation", fallbackText);
window.cpAPIInterface.setVariableValue("claraOverallAssessment", fallbackText);
window.cpAPIInterface.setVariableValue("claraFinalVerdict", isRemedial ? "Remedial training required." : "You may advance.");
window.cpAPIInterface.setVariableValue("claraTTSText", fallbackText);
window.cpAPIInterface.setVariableValue("isRemedial", String(isRemedial));
window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
});
} catch (error) {
window.cpAPIInterface.setVariableValue("claraEvaluation", "Error occurred. Continue training.");
window.cpAPIInterface.setVariableValue("isRemedial", "false");
window.cpAPIInterface.setVariableValue("evaluationLoading", "false");
window.cpAPIInterface.setVariableValue("claraAudioReady", "false");
window.cpAPIInterface.setVariableValue("debugError", "Fatal wrapper error: " + (error.message || "Unknown"));
}
})();