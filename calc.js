//----------------------------------------------------------------------
// adapte de Astro.C
//
// Calcul lune et soleil
// Written by JP Lathuile
// Oct 2003
// rev aout 2022
//----------------------------------------------------------------------


const Me = imports.misc.extensionUtils.getCurrentExtension(); 
const Gettext = imports.gettext.domain('moonphases');
const _ = Gettext.gettext;

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const MAXBCL = 10000

var iAA,iMM,iJJ;
var mLat,mLong;
var NLDte;

 //specific po bouquin de bouigue
let TJ,LR,LS,MR,OB,OBR,TS,T,V;
let DN,TS2,NOB,AZR,PAR,BL,CP;
let AH,AHO,AHR,BR,CAZ,DR,ER,dHH,HH,JJ,LAR; 
let HJ,E,LL,LSM,NL,NU,P,PL,RA1,RA2;
let Hw=[];   
let X1,X2,iLine,HHw,F,K,ZK;
let tampon;
let sTmpRet;
let bclSecu;


function sunfunc() {
    sTmpRet=""; // efface tampon sortie
    lemidcouch(iAA,iMM,iJJ);
    return sTmpRet;
}


function moonfunc() {
    sTmpRet=""; // efface tampon sortie
    levlun(iAA,iMM,iJJ);
    Eclairag();
    return sTmpRet;
}

//table lune
function moontabfunc() {
    sTmpRet=""; // efface tampon sortie
    prphalun(iAA,iMM,iJJ);
    return sTmpRet;
}


function sortRapport(stoAdd)
{
    sTmpRet+=stoAdd;
    sTmpRet+="\n";
}

function Sexa2Dec ( x)
{
    let y;

    if (x>0) {
        y=Math.floor(x);
        y=y+(x-y)/0.6;
    }
    else {
        y=Math.ceil(x);
        y=y-(y-x)/0.6;
    }
    return y;
}


//========================================================================
//utilitaires 

//MODULE "SOL"
function sol(ans)
{
    let ASO,D,ES,MS,PS,R,BJ;
    let TX,VS;
   
    JJ = JJ - DN;
    BJ = JJ - 2451545.0;
    TJ=Math.floor(BJ-HJ); 
    if (TJ<0) TJ++; 
    TJ=TJ/36525.0;   
    T = BJ / 36525.0;

    LSM=280.4659+36000.76953*T+.0003025*T*T;
    //LSM=280.46646+36000.76983*T+.0003032*T*T;
    LSM=REDCAD(LSM);  
    PS=282.9405+1.72009*T+.0004628*T*T+.00000033*T*T*T;
    PS=REDCAD(PS);
    ES=.016709114-.000042052*T-.000000126*T*T;
    MS=LSM-PS; MR=MS*RA1; E=ES;
    ANOMAL();
    VS=V/RA1;
    LS=PS+VS;  
    LS=REDCAD(LS); 
    TX=BJ/365242.2;
    OB=23.43928-.1301403*TX-.00014163*TX*TX+.00050833*TX*TX*TX;
    OBR=OB*RA1;
    TS=280.4603+36000.7697*TJ+.00038708*TJ*TJ;
    TS=((dHH-12)*36624.22/36524.22)+REDCAD(TS)/15+mLong/15;
    if (TS<0) TS=TS+24;
    if (TS>24) TS=TS-24;
    LL=218.31617+481267.88088*T-.00112767*T*T+.000001888*T*T*T;
    LL=REDCAD(LL);
    NL=125.043347-1934.137846*T+.00208444*T*T+.000002222*T*T*T;
    NL=REDCAD(NL);
    PL=83.353248+4069.013343*T-.0103625*T*T-.0000125*T*T*T;
    PL=REDCAD(PL);
    R=(LL-LSM)*RA1; D=(LL-NL)*RA1;// G=(LL-PL)*RA1;// W=MR;
    NU=-17.2327*Math.sin(NL*RA1)/3600-1.2729*Math.sin(LSM*RA1*2)/3600;
    NU=NU+.2088*Math.sin(2*NL*RA1)/3600-.2037*Math.sin(LL*2*RA1)/3600;
    NOB=9.21*Math.cos(NL*RA1)/3600+.5522*Math.cos(LSM*RA1*2)/3600;
    OB=OB+NOB; OBR=OB*RA1;
    TS=TS+NU*Math.cos(OBR)/15;// SS=.266567/XS;
    ASO=-20.496*(1+ES*Math.cos(V))/3600;
    LS=PS+VS+NU+ASO+.0018*Math.sin(R);//+DY;
    LS=Math.floor(REDCAD(LS)*10000)/10000; LL=Math.floor(LL*1000)/1000;
}

//MODULE "RED"
//MODULE "REDCAD"
function REDCAD( ang)
{    
    let IK;

    IK=Math.floor(ang/360);
    if (IK<0) IK++;
    ang=ang-IK*360;
    if (ang<0) ang+=360;  
    return ang;
}

//MODULE "ANOMAL"
function ANOMAL()
{
    let U,U1,TV;

    U1=MR;
    bclSecu=0
    do
    {
        if (bclSecu++>MAXBCL) break; //secu
        U=U1;
        U1=MR+E*Math.sin(U);
    }while(Math.abs(U-U1)>.00001); //sorti 2 zero
    TV=Math.sin(U1/2)/Math.cos(U1/2);
    TV*=(Math.sqrt((1+E)/(1-E)));
    V=Math.atan(TV)*2;
    if (V<0) V=V+Math.PI*2;
} 
 
//MODULE "ECLIEQUA"
function ECLIEQUA()
{
    let AR,SD,CD,COA,SA;

    SD=Math.sin(BR)*Math.cos(OBR)+Math.cos(BR)*Math.sin(OBR)*Math.sin(LR);
    if ((SD>0) && ((1-SD*SD)<=0))
        DR=Math.PI/2;
    else {
        if ((SD<0) && ((1-SD*SD)<=0))
            DR=-Math.PI/2;
        else {
            CD = Math.sqrt(1 - SD *SD); DR = Math.atan(SD/CD);
            COA = Math.cos(BR) * Math.cos(LR) / CD;
            if (COA==0)
                if (SA>0)  AR=PI/2; else AR=-PI/2;
            else {
                if ((1 - COA*COA) <= 0)
                    AR = 0;
                else {
                    SA=(Math.cos(OBR)*Math.sin(DR)-Math.sin(BR))/(Math.sin(OBR)*Math.cos(DR));
                    AR=Math.atan(SA/COA);
                }
                if ((COA > 0) && (SA<0)) AR = Math.PI * 2 + AR;
                if ((COA < 0) && (SA>0)) AR = AR + Math.PI;
                if ((COA < 0) && (SA<0)) AR = Math.PI + AR;
            }
            AH=AR/RA2;// DD=DR/RA1;
            return;
        }
    }  
    sortRapport(_("AH est indeterminé."));
    // DD=DR/RA1;
}
//MODULE "EQUAHOR"
function EQUAHOR()
{
     let AZX,CZ,SAZ,SZ,ZR;

     if (AHR>Math.PI) AHR=AHR-Math.PI*2;
     CZ=Math.sin(DR)*Math.sin(LAR)+Math.cos(DR)*Math.cos(LAR)*Math.cos(AHR);
     if ((1-CZ*CZ)<=0)
     {
         SZ=0; ZR=0;      
         sortRapport(_("Direction zenithale !"));
     }
     else
     {
         SZ=Math.sqrt(1-CZ*CZ);
         if (CZ==0)  ZR=Math.PI/2; else ZR=Math.atan(SZ/CZ);
         if (CZ<0) ZR=Math.PI+ZR;
         SAZ=Math.cos(DR)*Math.sin(AHR)/Math.sin(ZR);
         if (((1-SAZ*SAZ)<=0) && (SAZ<0))
                 AZR=Math.PI*1.5;
         else {
            if ((1-SAZ*SAZ)<=0)
                AZR=Math.PI/2;
            else {
                CAZ=(Math.sin(LAR)*Math.cos(ZR)-Math.sin(DR))/(Math.cos(LAR)*Math.sin(ZR));
                if (CAZ==0) {
                    AZR=Math.PI/2;
                    if (SAZ<0) AZR=-AZR;
                    return; //goto out;
                }
                AZX=Math.atan(SAZ/CAZ);
                if ((SAZ>=0) && (CAZ>0)) {
                    AZR=AZX; 
                    return; //goto out;
                }
            }
        }
        if ((SAZ<0) && (CAZ>0)) {
            AZR=AZX+PI*2;
            return; // goto out;
        }
    }
    if ((SAZ>=0) && (CAZ<0))
        AZR=Math.PI+AZX;
    else if ((SAZ<0) && (CAZ<0)) AZR=Math.PI+AZX;
    //out:  //Z=Math.floor(ZR*1000/RA1)/1000; AZ=Math.floor(AZR*1000/RA1)/1000;   
}


//MODULE "JULIEN"
function JULIEN( ans, mois, jour, heure)
{
    let B,C,DM,N; 
    let FJ;
     
    C=ans % 4; B=ans+4712; N=B*365+Math.floor((B+3)/4);DN=0;
    if (C==0)  {
        F=1; FJ=1;
    }
    else  {
        F=0; FJ=0;
    }
    if (ans>1582) DN=10;
    if ((ans==1582) && (mois==12) && (jour>19)) DN=10;
    if (ans>=1700)  {
        DM=-Math.floor((ans-1)/100)+12+Math.floor((ans-1)/400);
    }
    if ((ans/400!=Math.floor(ans/400)) && (ans/100==Math.floor(ans/100))) F=0;
    DN=DN-DM;
    if (mois <= 8) N=N+(mois-1)*30+Math.floor(mois/2);
    if (mois > 8) N=N+(mois-1)*30+Math.floor((mois-1)/2)+1;
    if ((mois >= 3) && (F==1)) N-=1;
    if ((mois >= 3) && (F==0)) {
        N=N-2+FJ;
        DN+=FJ;
    }
    JJ=N+jour-1.5; HJ=heure/24.0; JJ=JJ+HJ;
}


function sprgm( AA, M, J, HH)
{
    let HP;
   
    dHH=HH;
    bclSecu=0;
    do {
        if (bclSecu++>MAXBCL) break; //secu
        lever();
        HH=(AH+AHO*K-TS2)*.99727+12-mLong/15;
        if (HH<0) HH=HH+24; 
        HP=HH;   
        JULIEN(AA,M,J,HH);
        sol(AA);
        BR=0; LR=LS*RA1;
        ECLIEQUA();
        lever();
        HH=(AH+AHO*K-TS2)*.99727+12-mLong/15;
        if (HH<0) HH=HH+24; 
    }while(Math.abs(HP-HH)>.00001); //sortie 2 zero
    //X=HH;
    if (HH<0) HH+=24; 
    X1=Math.floor(HH); 
    X2=Math.floor((HH-X1)*60); //X3=Math.floor((X-X1-X2/60)*36000)/10;
    if (K!=0) X2=Math.floor(X2+.5);
    if (X2==60) {
        X2=0; X1=X1+1;
    }
}


function lever()
{   
    let CAH,TAH;

    CAH=(Math.sin(ER)-Math.sin(LAR)*Math.sin(DR))/(Math.cos(LAR)*Math.cos(DR));
    if ((Math.abs(CAH)>1) && ( (Math.abs(LAR-DR))>=(Math.PI/2-ER)  )){
        ZK=2; AHO=12;
    }
    else {
        if (Math.abs(CAH)<=1){
            TAH=Math.sqrt(1-CAH*CAH)/CAH; AHR=Math.atan(TAH);
            if (CAH<0) AHR=AHR+Math.PI;
            AHO=AHR/RA2;
        }      
        else
        ZK=1;
    }     
}


function lemidcouch( AA, M, J)
{
    let HH;
                 
    RA1=Math.PI/180;
    RA2=Math.PI/12;
    LAR = mLat * RA1;   
    ER=-34.5*RA1/60;  HH=12.0-mLong/15.0;  K=0; 
    dHH=HH;
    JULIEN(AA,M,J,HH);
    sol(AA);
    BR=0; LR=LS*RA1;
    ECLIEQUA();
    TS2=TS;
    HH=(AH-TS2)*.99727+12-mLong/15;  
   // sprgm(AA,M,J,HH);      
    if (ZK!=2){
        K=-1; 
        sprgm(AA,M,J,HH);
        if (ZK!=1){ 
            tampon=_("Soleil Lever : ")+X1+" : "+ Intl.NumberFormat('default', { minimumIntegerDigits: 2 }).format(X2)+" " ;
            sortRapport(tampon);
            K=1;
            sprgm(AA,M,J,HH);
            tampon=_("Soleil Coucher : ")+X1+" : "+Intl.NumberFormat('default', { minimumIntegerDigits: 2 }).format(X2)+" " ;
            sortRapport(tampon);
        } 
        else {    
            sortRapport(_("...Soleil toujours dans le ciel."));
        }
    }
    else {
        sortRapport(_("...Soleil au-dessous de l'Horizon."));      
    }  
    return;
}        

  
function levlun( A, M, J)
{   
    let COR,TS1;
    
    RA1=Math.PI/180;  RA2=Math.PI/12;       
    LAR = mLat * RA1; 
    HHw=0;  
    dHH=12-mLong/15; ZK=0; 
    JULIEN(A,M,J,dHH);
    sol(A);
    lun();
    BR=BL*RA1; LR=LL*RA1;
    ECLIEQUA();
    paral();
    COR=PAR-34.5; ER=COR*RA1/60;
    lever();
    TS1=TS; K=-1;
    Hw=_("Lune Lever : ");
    TS2=TS1;
    sprgm5( A, M, J, dHH);
    
    if (ZK!=0) sprgm3();
    sprgm4();
    K=1; Hw=_("Lune Coucher : ");
    TS2=TS1;
    sprgm5( A, M, J, dHH);
    if (ZK!=0) sprgm3();
    //  else
    sprgm4();
}
 
function sprgm3()
{                
    if (ZK==2){
        sortRapport(_("Lune au-dessous de l'horizon."));    
        ZK=0;
        return;
    } 
    if (ZK==1) {
        sortRapport(_("Lune dans le ciel."));    
        ZK=0;
        return;
    }    
         //   sprgm4();
}

function sprgm4()    
{                 
    if (HHw==1)     {
        sortRapport(_("Impossible."));    
        HHw=0;
        X1=0;X2=0;ZK=0;
    }    
    else {  
       tampon=Hw+"  "+X1+" : "+Intl.NumberFormat('default', { minimumIntegerDigits: 2 }).format(X2)+" " ;
       sortRapport(tampon);    
       ZK=0;
    }   
} 


function sprgm5( A, M, J, HH)
{           
    let HP;
    let tk1;
    
    bclSecu=0; 
    do{
        if (bclSecu++>MAXBCL) break; //secu
        HH=(AH+AHO*K-TS2)*.99727-mLong/15+12;    //175
        tk1=0;
        if ( HH>24)     {
            TS2+=24;
            tk1=1;
        }
        if ( HH<0)      {
            TS2-=24;
            tk1=1;
        }
    }while(tk1==1);
            
    bclSecu=0;
    do {
        HP=HH;
        JULIEN(A,M,J,HH);
        sol(A);
        lun();
        BR=BL*RA1; LR=LL*RA1;
        ECLIEQUA();
        lever();
                    
        do{ 
            if (bclSecu++>MAXBCL) break; //secu
            HH=(AH+AHO*K-TS2)*.99727-mLong/15+12;
            tk1=0;
            if ( HH>24)  {
                TS2=TS2+24;
                tk1=1;
            }
            if ( HH<0) {
                TS2=TS2-24;
                tk1=1;
            }
        }while(tk1==1);  
          
          if (bclSecu++>MAXBCL) break; //secu              
        if (Math.abs(HH-HP)>12)  {
            HHw=1;
            return;
        }    
    }while(Math.abs(HP-HH)>.00001);  //suprime 1 zero
            // X=HH;
    if (HH<0) HH+=24; 
    if (HH>24) HH-=24; 
    X1=Math.floor(HH); X2=Math.floor(Math.abs(HH-X1)*600+.5)/10;
    if (K!=0) X2=Math.floor(X2+.5);
    if (X2==60) {
        X2=0; X1++;
    }             
}              
           
 //MODULE "PARAL"
function paral()
{
     let ALFA,TPSI,PSI,RO2,RO,SP,PB,TFI;
     
     ALFA=1/298.257; TFI=(1-ALFA)*(1-ALFA)*Math.sin(LAR)/Math.cos(LAR);
    // FI=atan(TFI)/RA1;
     TPSI=(1-ALFA)*Math.sin(LAR)/Math.cos(LAR); PSI=Math.atan(TPSI);
     RO2=Math.cos(PSI)*Math.cos(PSI)+(1-ALFA)*(1-ALFA) * Math.sin(PSI)*Math.sin(PSI);
     RO=Math.sqrt(RO2); SP=Math.sin(P)*RO; CP=Math.sqrt(1-SP*SP);
     PB=Math.atan(SP/CP); PAR=PB*60/RA1;
}
               
 //MODULE "LUN"
function lun()
{
     let D,CL,L,CB,G,R;
     
     R=(LL-LSM)*RA1; D=(LL-NL)*RA1;G=(LL-PL)*RA1; 
     CL=22639.5*Math.sin(G)+4586.426*Math.sin(R*2-G)+2369.902*Math.sin(R*2);
     CL=CL+769.016*Math.sin(G*2)-668.111*Math.sin(MR)-411.608*Math.sin(D*2);
     CL=CL+211.656*Math.sin(R*2-G*2)+205.962*Math.sin(R*2-G-MR);
     CL=CL+191.953*Math.sin(R*2+G)+165.145*Math.sin(R*2-MR)+147.693*Math.sin(G-MR);
     CL=CL-125.154*Math.sin(R)-109.667*Math.sin(G+MR)+55.173*Math.sin(R*2-D*2);
     CL=CL-45.1*Math.sin(D*2+G)-39.532*Math.sin(D*2-G)+38.428*Math.sin(R*4-G);
     CL=CL+36.124*Math.sin(G*3)+30.773*Math.sin(R*4-G*2);
     CL=CL-28.475*Math.sin(R*2-G+MR)-24.42*Math.sin(R*2+MR)-18.609*Math.sin(R-G);
     CL=CL+18.023*Math.sin(R+MR)+14.527*Math.sin(R*2+G-MR)+14.387*Math.sin(R*2+G*2);
     CL=CL+13.902*Math.sin(R*4)+13.193*Math.sin(R*2-G*3)+9.703*Math.sin(G*2-MR);
     
     L=LL+CL/3600; 
     CB=18461.49*Math.sin(D)+1010.18*Math.sin(G+D)+999.695*Math.sin(G-D);
     CB=CB+623.658*Math.sin(R*2-D)+199.485*Math.sin(R*2-G+D);
     CB=CB-166.6*Math.sin(D+G-R*2)+117.262*Math.sin(R*2+D)+61.9*Math.sin(G*2+D);
     CB=CB+33.359*Math.sin(R*2+G-D)+31.763*Math.sin(G*2-D)+29.689*Math.sin(R*2-MR-D);
     CB=CB+15.565*Math.sin(R*2-G*2-D)+15.122*Math.sin(R*2+G+D);

     BL=CB/3600;
     CP=186.54*Math.cos(G)+34.312*Math.cos(R*2-G)+28.233*Math.cos(R*2);
     CP=CP+10.166*Math.cos(G*2)+3.086*Math.cos(R*2+G)+1.92*Math.cos(R*2-MR);

     P=(3422.7+CP)*RA1/3600; LL=L+NU; 
     //SL=.25905*Math.sin(P)/.0165932;
     if (LL>=360)  LL=LL-360;
     LL=Math.floor(LL*1000)/1000; BL=Math.floor(BL*10000)/10000;
     P=Math.floor(P*1000000)/1000000;
}      

//MODULE "PRPHALUN"
function prphalun(A, M,J)
{
    const  Qw=[_("P.Q."),_("P.L."),_("D.Q."),_("N.L.")]; 
    let VJ,Q,YK;
    let DIF,DIF1,DIF2,LS1,LS2,LL1,LL2; 
    let XKK=[333,303,272, 242,211,180,150,119,89,58,1000];
    let Cont,Jn,Mw,MN,KC;
    let XK,Jdos,S,JJ0,DJ ;
     
    RA1=Math.PI/180; RA2=Math.PI/12;
    Jdos=1; dHH=0;YK=0; K=0;KC=0;
    JULIEN(A,1,1,0);
    JJ0=JJ+.5-DN;
    JULIEN(A,M-1,1,0);
    sol(A);
    lun();                                      
    DIF=LL-LS;//JJ0=JJ+.5;
    if (DIF<0) DIF+=360;
    Q=(Math.floor(DIF/90)+1);
    VJ=(Math.floor((90*Q-DIF)/12.5));
   
    while(1){
        JJ=JJ+VJ;
        while(1){   
            JJ+=DN;
            sol(A);
            LS1=Math.floor(LS*10000)/10000;
            lun();
            LL1=LL; 
            while(1){  
                JJ=JJ+1+DN;
                sol(A);
                LS2=Math.floor(LS*10000)/10000;
                lun();
                LL2=LL;
                if  ((LL1>270) && (LL2<90)) LL2=LL2+360;
                if ((LS1>270) && (LS2<90)) LS2=LS2+360;
                DIF1=LL1-LS1; DIF2=LL2-LS2; DIF=DIF2-DIF1;
                if ((DIF1<0) || (DIF2<0))  {
                    DIF1=DIF1+360; DIF2=DIF2+360;
                }           
                DJ=(90*Q-DIF1)/DIF; 
                if (DJ>1)  {
                    LL1=LL2; LS1=LS2;
                } 
                else break;
            }
            if ( KC==0) {
                JJ=JJ-1+DJ; KC=KC+1;
            } else break;
        }        
        TJ= JJ-1+DJ;
        Cont=-1;
        DJ=TJ-JJ0; 
        if (A/4==Math.floor(A/4)) F=1;
        if ((K!=1) && (A/100==Math.floor(A/100)) && (A/400!=Math.floor(A/400)))  F=0;
        if (DJ>58) DJ=DJ-F;  
        bclSecu=0;
        do   {
            if (bclSecu++>MAXBCL) break; //secu
            Cont++; 
            XK=XKK[Cont];Mw=12-Cont;
            if (XK==1000){
                if (DJ>30)  {
                    XK=30; Mw=2;
                }        
                else  {
                    XK=-1; Mw=1;  
                } 
                break;
            } 
        }while(Math.floor(DJ-.5)<=XK) ;
        Jdos=DJ-XK;
        if ((DJ>333) && (Jdos>=31.5))    {
            A++; Jdos-=31; Mw=1;
        }  
        Jn=Math.floor(Jdos); dHH=Math.floor((Jdos-Jn)*24); 
        MN=Math.floor(((Jdos-Jn)*24-dHH)*60); 
        S=Math.floor((((Jdos-Jn)*24-dHH)*60-MN)*60); 
        dHH+=12;
        if (dHH>=24)  {
            dHH=dHH-24; Jn=Jn+1;
        }     
        if ( S>=30) MN++;
        if ((Mw==1) &&(YK==1)) return;
        if (( M-1==Mw)||( M==Mw)||( M+1==Mw)) { 
            if (( Math.abs(new Date(A, Mw-1, Jn, Math.floor(dHH), MN, 0, 0)-new Date(A,M-1,J,0,0,0,0)) / _MS_PER_DAY)<15){ //affiche a +- 15 Jours
                tampon=Qw[Q-1]+" le "+Jn+"/"+Mw+"  "+Math.floor(dHH)+" : "+Intl.NumberFormat('default', { minimumIntegerDigits: 2 }).format(MN)+" " ;
                sortRapport(tampon);   
                if (Q==4) {//retourne date nouvelle lune
                    NLDte=new Date(A, Mw-1, Jn, Math.floor(dHH), MN, 0, 0);
                }
            }
        }       
        if (Mw==12) YK=1;
        dHH=0; MN=0; S=0; VJ=6; Q++;
        if (Q>4){
            Q=Q-4; KC=0;
        }       
        if (TJ>JJ0+365+F) return; 
        if (Mw>M+1) return;
        JJ=TJ; 
    }  
}

function Eclairag()
{      
    let ii; 
    let dd,di;
      
    //p113  calcul astro J.MEEUS   
    JULIEN(iAA,iMM,iJJ,0);
    sol(iAA);
    lun();  
    dd=Math.acos(Math.cos((LL-LS)*RA1)*Math.cos(BL*RA1));
    dd/=RA1;
    di=180-dd-0.1468*((1-0.0549*Math.sin((LL-PL)*RA1)/(1-0.0167*Math.sin(MR*RA1))))*Math.sin(dd*RA1);
    ii=(100*(1+Math.cos(di*RA1))/2);

    tampon=_("Luminosité : ")+Math.floor(ii)+"% ";
    sortRapport(tampon);    
}

function CleanVar(){
    iAA=null;
    iMM=null;
    iJJ=null;
    mLat=null;
    mLong=null;
    NLDte=null;

    TJ=null;
    LR=null;
    LS=null;
    MR=null;
    OB=null;
    OBR=null;
    TS=null;
    T=null;
    V=null;
    DN=null;
    TS2=null;
    NOB=null;
    AZR=null;
    PAR=null;
    BL=null;
    CP=null;
    AH=null;
    AHO=null;
    AHR=null;
    BR=null;
    CAZ=null;
    DR=null;
    ER=null;
    dHH=null;
    HH=null;
    JJ=null;
    LAR=null; 
    HJ=null;
    E=null;
    LL=null;
    LSM=null;
    NL=null;
    NU=null;
    P=null;
    PL=null;
    RA1=null;
    RA2=null;
    Hw=null;
    X1=null;
    X2=null;
    iLine=null;
    HHw=null;
    F=null;
    K=null;
    ZK=null;
    tampon=null;
    sTmpRet=null;
    bclSecu=null;

}

//end of file
