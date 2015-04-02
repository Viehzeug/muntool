all:
	echo "meow TODO implement me"

documentation:
	cd js && rm -rf out && jsdoc --private * && \
	mv out ../documentation

clean:
	rm -rf documentation
