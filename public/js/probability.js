//----------------------------------------------------------------------------------------------
// Calculates a point Z(x), the Probability Density Function, on any normal curve. 
// This is the height of the point ON the normal curve.
// For values on the Standard Normal Curve, call with Mean = 0, StdDev = 1.
function NormalDensityZx(x, Mean, StdDev)
{
	var a = x - Mean;
	return Math.exp(-(a * a) / (2 * StdDev * StdDev)) / (Math.sqrt(2 * Math.PI) * StdDev); 
}
function NormalZ_all(points,mean,sigma){
	point = [];
	for(var i=0;i<=points;i++){
		var x = (mean-3*sigma) + i * 6*sigma/points;
		var y = NormalDensityZx(x,mean,sigma);
		point.push([x,y]);
	}
	return point;
}

//----------------------------------------------------------------------------------------------
// Calculates Q(x), the right tail area under the Standard Normal Curve. 
function StandardNormalQx(x)
{
	if(x === 0)	// no approximation necessary for 0
		return 0.50;
		
	var t1,t2,t3,t4,t5,qx;
	var negative = false;
	if(x < 0)
	{
		x = -x;
		negative = true;
	}
	t1 = 1 / (1 + (0.2316419 * x)); 
	t2 = t1 * t1; 
	t3 = t2 * t1; 
	t4 = t3 * t1; 
	t5 = t4 * t1;
	qx = NormalDensityZx(x,0,1) * ((0.319381530 * t1) + (-0.356563782 * t2) + 
								(1.781477937 * t3) + (-1.821255978 * t4) + (1.330274429 * t5));
	if(negative == true)
		qx = 1 - qx;
	return qx;
}
//----------------------------------------------------------------------------------------------
// Calculates P(x), the left tail area under the Standard Normal Curve, which is 1 - Q(x). 
function StandardNormalPx(x)
{
	return 1 - StandardNormalQx(x);
}
//----------------------------------------------------------------------------------------------
// Calculates A(x), the area under the Standard Normal Curve between +x and -x. 
function StandardNormalAx(x)
{
	return 1 - (2 * StandardNormalQx(Math.abs(x)));
}
//----------------------------------------------------------------------------------------------

