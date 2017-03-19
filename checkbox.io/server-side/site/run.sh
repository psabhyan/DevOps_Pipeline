npm test > log.txt 2> analysis.txt
if [ -s analysis.txt ]
then
        exit 1;

else
        rm -f empty.txt
        npm start        
fi
