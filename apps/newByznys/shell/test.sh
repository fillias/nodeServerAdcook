#! /bin/bash

# echo "prvni arg"
# echo $1
# echo "------------"


# echo "druhy arg"
# echo $2
# echo "------------"

# echo "treti arg"
# echo $3
# echo "------------"

reportOptions="&utf8=%E2%9C%93&tactical_report%5Btitle%5D=&tactical_report%5Bdate_range%5D=Date+Range&tactical_report%5Bdate_gte%5D=$2&tactical_report%5Bdate_lte%5D=$3&tactical_report%5Bshow_viewability%5D=0&tactical_report%5Bagency_id%5D=&tactical_report%5Badvertiser_id%5D=&tactical_report%5Bshow_custom_actions%5D=0&tactical_report%5Bcampaigns%5D%5B%5D=&tactical_report%5Bflights%5D%5B%5D=&tactical_report%5Bcreatives%5D%5B%5D=&tactical_report%5Btiers%5D%5B%5D=&tactical_report%5Bproducts%5D%5B%5D=&tactical_report%5Bflight_type%5D=&tactical_report%5Bsalesperson_id%5D=&tactical_report%5Btrafficker_id%5D=&tactical_report%5Bsites%5D%5B%5D=&tactical_report%5Bareas%5D%5B%5D=&tactical_report%5Bsizes%5D%5B%5D=&tactical_report%5Bemails%5D=&tactical_report%5Bhour_of_day_daily%5D=00&tactical_report%5Bminute_of_hour_daily%5D=00&tactical_report%5Bday_of_week%5D=0&tactical_report%5Bhour_of_day_weekly%5D=00&tactical_report%5Bday_of_month%5D=1&tactical_report%5Bhour_of_day_monthly%5D=00&tactical_report%5Bexpiration_in_words%5D="

echo -e "\n"

# xmlRes="$(cat ../downloadedReports/oneYearAgo.xml)"
# #xmlRes="$(cat ../downloadedReports/response.xml)"
# xmlResCharCount=$( wc -c <<<$xmlRes )

# echo $xmlRes
# echo -e "\n"
# echo $xmlResCharCount

# pokud nemam job id -- ma charcount 1 -- vyhod chybu a exit
# if [ "$xmlResCharCount" -eq 1 ]  ; then 
# 	echo "error"
# 	exit 0   
# fi


#echo $reportOptions

# myDir="$(pwd)"
# myDir+="/apps/newByznys/downloadedReports"

# echo $1 > "$myDir/$1.xml"
# echo $1 > "$myDir/$1.csv"

# cat "$myDir/$1.csv"

counter=1

while [[ counter -le 3 ]]; do
	sleep 10
	echo "Pokus cislo: $counter"
	echo -e "\n"

	(( counter++ ))

done



echo -e "\n\n"
echo -e "stazeno"

