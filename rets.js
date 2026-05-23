"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabaseClient_1 = require("../src/config/supabaseClient");
var axios_1 = require("axios");
var accessToken = "eb98d22ad5fe985ba14d26eee09f40ab";
// --- HELPERS ---
var formatArrayToString = function (arr) { return (arr && Array.isArray(arr) ? arr.join(", ") : ""); };
var formatParcelNumber = function (pid) { return (pid === null || pid === void 0 ? void 0 : pid.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1-$2-$3")) || ""; };
function getBathrooms(full, half) {
    var f = parseInt(full) || 0;
    var h = parseInt(half) || 0;
    return (f + h) > 0 ? (f + (h * 0.5)).toString() : '−';
}
/**
 * Fetches data from Bridge API with pagination
 */
function fetchFromBridge(structureType) {
    return __awaiter(this, void 0, void 0, function () {
        var fields, fieldsQuery, allListings, skip, url, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fields = [
                        'ParcelNumber', 'ListingId', 'StreetNumber', 'StreetName', 'StreetSuffix', 'ListingContractDate',
                        'ListingKeyNumeric', 'MlsStatus', 'OriginalListPrice', 'BuildingAreaTotal', 'LotSizeArea',
                        'PublicRemarks', 'AssociationAmenities', 'Appliances', 'Heating', 'ListOfficeKey',
                        'ParkingFeatures', 'MLSAreaMinor', 'PropertySubType', 'BathroomsHalf', 'BathroomsFull',
                        'BedroomsTotal', 'YearBuilt', 'ModificationTimestamp', 'BCRES_SubjectRemovalDate',
                        'ClosePrice', 'CloseDate', 'BCRES_Age', 'VirtualTourURLBranded', 'Stories',
                        'BCRES_MainFloorFinishedArea', 'BCRES_AboveMainFinishedArea', 'BCRES_AboveMain2FinishedArea',
                        'BCRES_BasementFinishedArea', 'BCRES_LivingAreaFinished', 'BCRES_TotalFloorUnfinishedArea', 'Media'
                    ];
                    fieldsQuery = fields.join(',');
                    allListings = [];
                    skip = 0;
                    console.log("\uD83D\uDCE1 Starting fetch for: ".concat(structureType));
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    url = "https://api.bridgedataoutput.com/api/v2/OData/bcres/Property?access_token=".concat(accessToken, "&$filter=StructureType/any(a: a eq '").concat(structureType, "') and MLSAreaMajor eq 'Squamish'&$select=").concat(fieldsQuery, "&$top=200&$skip=").concat(skip, "&$expand=ListOffice");
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 2:
                    response = _a.sent();
                    data = response.data.value;
                    allListings = allListings.concat(data);
                    console.log("\u2705 Fetched ".concat(allListings.length, " total..."));
                    if (data.length < 200)
                        return [3 /*break*/, 3];
                    skip += 200;
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, allListings];
            }
        });
    });
}
/**
 * Main Sync Process
 */
function syncDetachedListings() {
    return __awaiter(this, void 0, void 0, function () {
        var rawListings, latestByPid_1, processedListings, finalListingUploads, parcelUpdateBatch, _loop_1, _i, processedListings_1, listing, insErr, upsertErr, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, fetchFromBridge('Residential Detached')];
                case 1:
                    rawListings = _a.sent();
                    latestByPid_1 = {};
                    rawListings.forEach(function (raw) {
                        var _a;
                        var pid = formatParcelNumber(raw.ParcelNumber);
                        if (!latestByPid_1[pid] || new Date(raw.ListingContractDate) > new Date(latestByPid_1[pid].ListingDate)) {
                            latestByPid_1[pid] = {
                                PID: pid,
                                MLSNumber: raw.ListingId || "",
                                ListingDate: raw.ListingContractDate || "",
                                ListingID: String(raw.ListingKeyNumeric || ""),
                                Status: raw.MlsStatus || "",
                                AskingPrice: String(raw.OriginalListPrice || ""),
                                TotalFloorArea: String(raw.BuildingAreaTotal || ""),
                                ListingRemarks: raw.PublicRemarks || "",
                                Features: formatArrayToString(raw.Appliances),
                                SubArea: raw.MLSAreaMinor || "",
                                DwellType: raw.PropertySubType || "",
                                YearBuilt: String(raw.YearBuilt || ""),
                                ListingOffice: ((_a = raw.ListOffice) === null || _a === void 0 ? void 0 : _a.OfficeName) || "",
                                UpdateTime: raw.ModificationTimestamp || "",
                                SubjectRemovalDate: raw.BCRES_SubjectRemovalDate || "",
                                SoldPrice: String(raw.ClosePrice || ""),
                                CompletedDate: raw.CloseDate || "",
                                VirtualTour: raw.VirtualTourURLBranded || "",
                                Photos: raw.Media ? raw.Media.map(function (media) { return media.MediaURL; }) : [],
                                CivicAddress: "".concat(raw.StreetNumber || "", " ").concat(raw.StreetName || "", " ").concat(raw.StreetSuffix || "").trim(),
                                LotSize: String(raw.LotSizeArea || ""),
                                Amenities: formatArrayToString(raw.AssociationAmenities),
                                Heating: formatArrayToString(raw.Heating),
                                Parking: formatArrayToString(raw.ParkingFeatures),
                                HalfBaths: String(raw.BathroomsHalf || ""),
                                FullBaths: String(raw.BathroomsFull || ""),
                                Bedrooms: String(raw.BedroomsTotal || ""),
                                YearsConstructed: String(raw.BCRES_Age || ""),
                                Stories: String(raw.Stories || ""),
                                FirstFloor: String(raw.BCRES_MainFloorFinishedArea || ""),
                                SecondFloor: String(raw.BCRES_AboveMainFinishedArea || ""),
                                ThirdFloor: String(raw.BCRES_AboveMain2FinishedArea || ""),
                                FourthFloor: String(raw.BCRES_BasementFinishedArea || ""),
                                Finished: String(raw.BCRES_LivingAreaFinished || ""),
                                Unfinished: String(raw.BCRES_TotalFloorUnfinishedArea || "")
                            };
                        }
                    });
                    processedListings = Object.values(latestByPid_1);
                    // 2. Clear current table
                    console.log("🧹 Cleaning old listings...");
                    return [4 /*yield*/, supabaseClient_1.supabase.from('detached_listings').delete().neq('PID', '0')];
                case 2:
                    _a.sent();
                    finalListingUploads = [];
                    parcelUpdateBatch = [];
                    console.log("🔍 Enriching with Parcel data...");
                    _loop_1 = function (listing) {
                        var parcel, mlsHistory, exists;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, supabaseClient_1.supabase
                                        .from('parcels')
                                        .select('*')
                                        .eq('PID', listing.PID)
                                        .single()];
                                case 1:
                                    parcel = (_b.sent()).data;
                                    if (parcel) {
                                        mlsHistory = Array.isArray(parcel.MLSData) ? parcel.MLSData : [];
                                        if (listing.Status === 'Pending') {
                                            exists = mlsHistory.some(function (h) { return String(h.Price) === String(listing.SoldPrice) && h.Type === 'Pending'; });
                                            if (!exists) {
                                                mlsHistory.unshift({
                                                    Date: listing.SubjectRemovalDate,
                                                    Price: listing.SoldPrice,
                                                    Type: 'Pending'
                                                });
                                            }
                                        }
                                        finalListingUploads.push(__assign(__assign({}, listing), { MLSData: mlsHistory }));
                                        parcelUpdateBatch.push({
                                            PID: listing.PID,
                                            Status: listing.Status,
                                            Bedrooms: listing.Bedrooms,
                                            Bathrooms: getBathrooms(listing.FullBaths, listing.HalfBaths),
                                            YearsConstructed: listing.YearsConstructed,
                                            Stories: listing.Stories,
                                            FirstFloor: listing.FirstFloor,
                                            SecondFloor: listing.SecondFloor,
                                            ThirdFloor: listing.ThirdFloor,
                                            FourthFloor: listing.FourthFloor,
                                            Finished: listing.Finished,
                                            Unfinished: listing.Unfinished,
                                            VirtualTour: listing.VirtualTour,
                                            LastMLS: listing.MLSNumber,
                                            FloorArea: listing.TotalFloorArea,
                                            Photos: listing.Photos,
                                            MLSData: mlsHistory,
                                            LastMLSDate: listing.Status === 'Closed' ? listing.CompletedDate : (parcel.LastMLSDate || null)
                                        });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, processedListings_1 = processedListings;
                    _a.label = 3;
                case 3:
                    if (!(_i < processedListings_1.length)) return [3 /*break*/, 6];
                    listing = processedListings_1[_i];
                    return [5 /*yield**/, _loop_1(listing)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!(finalListingUploads.length > 0)) return [3 /*break*/, 8];
                    console.log("\uD83D\uDCE4 Uploading ".concat(finalListingUploads.length, " listings..."));
                    return [4 /*yield*/, supabaseClient_1.supabase.from('detached_listings').insert(finalListingUploads)];
                case 7:
                    insErr = (_a.sent()).error;
                    if (insErr)
                        throw insErr;
                    _a.label = 8;
                case 8:
                    if (!(parcelUpdateBatch.length > 0)) return [3 /*break*/, 10];
                    console.log("\uD83D\uDD04 Updating ".concat(parcelUpdateBatch.length, " parcels..."));
                    return [4 /*yield*/, supabaseClient_1.supabase.from('parcels').upsert(parcelUpdateBatch, { onConflict: 'PID' })];
                case 9:
                    upsertErr = (_a.sent()).error;
                    if (upsertErr)
                        throw upsertErr;
                    _a.label = 10;
                case 10:
                    console.log("🚀 Sync Complete!");
                    return [3 /*break*/, 12];
                case 11:
                    err_1 = _a.sent();
                    console.error("❌ Critical Sync Error:", err_1.message);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
syncDetachedListings();
